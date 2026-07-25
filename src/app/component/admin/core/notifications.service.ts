import { Injectable, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { messageErreur } from './admin-erreurs';

/**
 * Tous les retours visuels du panel passent par ici.
 *
 * Centraliser évite deux dérives : des toasts au vocabulaire incohérent d'un
 * écran à l'autre, et surtout l'affichage brut d'une erreur technique. La
 * méthode `erreur()` traduit systématiquement l'exception avant affichage.
 */
/*
 * Volontairement PAS `providedIn: 'root'`.
 *
 * Ce service dépend de `MessageService` et `ConfirmationService`, fournis par la
 * route du panel (`admin.routes.ts`) pour rester dans le morceau de code chargé à
 * la demande. Un service racine ne voit pas les fournisseurs d'une route : il
 * était instancié dans l'injecteur racine et échouait avec NG0201. Il est donc
 * déclaré aux côtés de ses dépendances.
 */
@Injectable()
export class Notifications {
  private readonly messages = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);

  succes(detail: string, resume = 'C\'est enregistré'): void {
    this.messages.add({ severity: 'success', summary: resume, detail, life: 3000 });
  }

  info(detail: string, resume = 'Information'): void {
    this.messages.add({ severity: 'info', summary: resume, detail, life: 3500 });
  }

  /** Prend l'exception brute : la traduction en français est faite ici. */
  erreur(err: unknown, contexte?: string): void {
    this.messages.add({
      severity: 'error',
      summary: 'Cela n\'a pas fonctionné',
      detail: messageErreur(err, contexte),
      life: 8000
    });
  }

  /** Message d'erreur déjà rédigé (validation locale, par exemple). */
  avertissement(detail: string, resume = 'Attention'): void {
    this.messages.add({ severity: 'warn', summary: resume, detail, life: 6000 });
  }

  /**
   * Confirmation de suppression. Le libellé NOMME toujours l'élément concerné :
   * « Supprimer le joueur Kitano ? » est sans ambiguïté, « Confirmer ? » ne l'est pas.
   */
  confirmerSuppression(options: {
    /** Ex. : « le joueur Kitano », « l'actualité "Victoire à Lyon" ». */
    quoi: string;
    /** Précision facultative affichée sous la question. */
    consequence?: string;
    action: () => void;
  }): void {
    this.confirmation.confirm({
      header: 'Confirmer la suppression',
      message: `Supprimer ${options.quoi} ?<br><span class="text-white/60">${
        options.consequence ?? 'Cette action est définitive.'
      }</span>`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: options.action
    });
  }

  /** Confirmation générique (autre chose qu'une suppression). */
  confirmer(options: {
    titre: string;
    message: string;
    libelleAction?: string;
    action: () => void;
  }): void {
    this.confirmation.confirm({
      header: options.titre,
      message: options.message,
      icon: 'pi pi-question-circle',
      acceptLabel: options.libelleAction ?? 'Continuer',
      rejectLabel: 'Annuler',
      rejectButtonStyleClass: 'p-button-text',
      accept: options.action
    });
  }
}
