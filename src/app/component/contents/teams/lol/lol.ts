import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';

import { TeamCard } from './team-card/team-card';
import { ApiService } from '../../../../core/api/api.service';
import { API_LOADING, ApiState } from '../../../../core/api/api-state';
import { Role, Team, TeamMember, TeamsResponse } from '../../../../core/api/models';

@Component({
  selector: 'app-lol',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    TeamCard
  ],
  templateUrl: './lol.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./lol.scss']
})
export class Lol {
  private readonly api = inject(ApiService);

  /** État de `GET /api/teams?game=lol`, rejoué à chaque changement de langue. */
  readonly etat = toSignal(this.api.getTeams('lol'), {
    initialValue: API_LOADING as ApiState<TeamsResponse>
  });

  readonly teams = computed<Team[]>(() => this.etat().data?.teams ?? []);

  /** Rôles indexés par clé — remplace les maps d'icônes autrefois en dur. */
  private readonly rolesParCle = computed(
    () => new Map<string, Role>((this.etat().data?.roles ?? []).map((role) => [role.key, role]))
  );

  /** Équipe choisie par l'utilisateur ; `null` tant qu'il n'a rien choisi. */
  private readonly cleSelectionnee = signal<string | null>(null);

  /** L'équipe affichée : celle choisie, sinon la première renvoyée par l'API. */
  readonly selectedTeam = computed<Team | null>(() => {
    const teams = this.teams();
    const cle = this.cleSelectionnee();
    return teams.find((team) => team.key === cle) ?? teams[0] ?? null;
  });

  selectTeam(team: Team): void {
    this.cleSelectionnee.set(team.key);
  }

  trackByTeamId(_index: number, team: Team): string {
    return team.id;
  }

  trackByMemberId(_index: number, membre: TeamMember): string {
    return membre.id;
  }

  /**
   * Chemin d'icône (ou classe PrimeIcons) associé à un rôle. Passé tel quel à
   * `app-team-card`, d'où la forme « propriété fléchée » qui garde le `this`.
   */
  readonly getRoleIcon = (role: string): string =>
    this.rolesParCle().get(role)?.iconPath ?? 'pi-user';
}
