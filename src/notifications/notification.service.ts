import { Injectable, Logger } from '@nestjs/common';

export interface NotificationResult {
  userId: string;
  success: boolean;
  message: string;
  durationMs: number;
}

export interface NotifyAllReport {
  strategy: 'sequential' | 'parallel' | 'resilient';
  totalDurationMs: number;
  succeeded: number;
  failed: number;
  details: NotificationResult[];
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  /**
   * Simule l'envoi d'une notification à un utilisateur.
   * Délai de 500ms pour simuler un appel réseau.
   * Échoue pour les userId contenant "fail" (pour tester la gestion d'erreurs).
   */
  private async sendNotification(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userId.toLowerCase().includes('fail')) {
          reject(new Error(`Serveur SMTP indisponible pour ${userId}`));
        } else {
          resolve(`Notification envoyée à ${userId}`);
        }
      }, 500);
    });
  }

  /**
   * Mesure le temps d'exécution d'un appel async.
   */
  private async timed<T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; durationMs: number }> {
    const start = Date.now();
    const result = await fn();
    return { result, durationMs: Date.now() - start };
  }

  // ─── Version 1 : Séquentielle ────────────────────────────

  /**
   * Envoie les notifications une par une.
   * Chaque envoi attend le précédent.
   * Temps total ≈ 500ms × N
   *
   * ✅ Simple à comprendre
   * ✅ Gestion d'erreurs granulaire
   * ❌ Très lent pour beaucoup d'utilisateurs
   */
  async notifyAllSequential(userIds: string[]): Promise<NotifyAllReport> {
    this.logger.log(`[Séquentiel] Envoi à ${userIds.length} utilisateurs...`);
    const start = Date.now();
    const details: NotificationResult[] = [];

    for (const userId of userIds) {
      const itemStart = Date.now();
      try {
        const message = await this.sendNotification(userId);
        details.push({
          userId,
          success: true,
          message,
          durationMs: Date.now() - itemStart,
        });
        this.logger.log(`  ✅ ${message}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erreur inconnue';
        details.push({
          userId,
          success: false,
          message: msg,
          durationMs: Date.now() - itemStart,
        });
        this.logger.warn(`  ❌ ${msg}`);
      }
    }

    const totalDurationMs = Date.now() - start;
    const succeeded = details.filter((d) => d.success).length;
    const failed = details.filter((d) => !d.success).length;

    this.logger.log(
      `[Séquentiel] Terminé en ${totalDurationMs}ms — ${succeeded} ok, ${failed} erreurs`,
    );

    return {
      strategy: 'sequential',
      totalDurationMs,
      succeeded,
      failed,
      details,
    };
  }

  // ─── Version 2 : Parallèle (Promise.all) ─────────────────

  /**
   * Envoie toutes les notifications en parallèle.
   * Temps total ≈ 500ms (le temps du plus lent)
   *
   * ✅ Très rapide
   * ❌ Échoue dès la première erreur → on perd tous les résultats
   * ❌ Pas adapté si certaines notifications peuvent échouer
   */
  async notifyAllParallel(userIds: string[]): Promise<NotifyAllReport> {
    this.logger.log(`[Parallèle] Envoi à ${userIds.length} utilisateurs...`);
    const start = Date.now();

    try {
      const messages = await Promise.all(
        userIds.map((userId) => this.sendNotification(userId)),
      );

      const totalDurationMs = Date.now() - start;
      const details: NotificationResult[] = messages.map((message, i) => ({
        userId: userIds[i],
        success: true,
        message,
        durationMs: totalDurationMs,
      }));

      this.logger.log(
        `[Parallèle] Terminé en ${totalDurationMs}ms — ${messages.length} ok`,
      );
      return {
        strategy: 'parallel',
        totalDurationMs,
        succeeded: messages.length,
        failed: 0,
        details,
      };
    } catch (error) {
      const totalDurationMs = Date.now() - start;
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';

      this.logger.error(`[Parallèle] Échoué en ${totalDurationMs}ms — ${msg}`);
      this.logger.warn(
        `  ⚠️  Les résultats des notifications réussies sont perdus !`,
      );

      return {
        strategy: 'parallel',
        totalDurationMs,
        succeeded: 0,
        failed: userIds.length,
        details: [
          {
            userId: 'all',
            success: false,
            message: msg,
            durationMs: totalDurationMs,
          },
        ],
      };
    }
  }

  // ─── Version 3 : Résiliente (Promise.allSettled) ──────────

  /**
   * Envoie toutes les notifications en parallèle.
   * Attend TOUTES les réponses, même en cas d'erreur.
   * Temps total ≈ 500ms
   *
   * ✅ Rapide (parallèle)
   * ✅ Chaque résultat est traité individuellement
   * ✅ Adapté à la production : on peut loguer / relancer les échecs
   */
  async notifyAllResilient(userIds: string[]): Promise<NotifyAllReport> {
    this.logger.log(`[Résilient] Envoi à ${userIds.length} utilisateurs...`);
    const start = Date.now();

    const results = await Promise.allSettled(
      userIds.map((userId) => this.sendNotification(userId)),
    );

    const totalDurationMs = Date.now() - start;
    const details: NotificationResult[] = results.map((result, i) => {
      if (result.status === 'fulfilled') {
        this.logger.log(`  ✅ ${result.value}`);
        return {
          userId: userIds[i],
          success: true,
          message: result.value,
          durationMs: totalDurationMs,
        };
      } else {
        const msg =
          result.reason instanceof Error
            ? result.reason.message
            : 'Erreur inconnue';
        this.logger.warn(`  ❌ ${userIds[i]} : ${msg}`);
        return {
          userId: userIds[i],
          success: false,
          message: msg,
          durationMs: totalDurationMs,
        };
      }
    });

    const succeeded = details.filter((d) => d.success).length;
    const failed = details.filter((d) => !d.success).length;

    this.logger.log(
      `[Résilient] Terminé en ${totalDurationMs}ms — ${succeeded} ok, ${failed} erreurs`,
    );

    return {
      strategy: 'resilient',
      totalDurationMs,
      succeeded,
      failed,
      details,
    };
  }
}
