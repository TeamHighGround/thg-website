import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

interface Tuile {
  chemin: string;
  titre: string;
  /** Une phrase, en langage courant, sur ce que contient la section. */
  explication: string;
  icone: string;
}

/**
 * Accueil du panel.
 *
 * De grandes tuiles plutôt qu'un tableau de bord chargé de statistiques : la
 * question que se pose quelqu'un qui arrive ici est « où est-ce que je modifie
 * telle chose ? ». Chaque tuile y répond en une phrase.
 */
@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html'
})
export class AdminHome {
  private readonly auth = inject(AuthService);
  readonly utilisateur = this.auth.utilisateur;

  readonly tuiles: Tuile[] = [
    {
      chemin: '/admin/rosters',
      titre: 'Rosters',
      explication: 'Les équipes, les joueurs et le staff de chaque jeu : nom, rôle, photo et réseaux sociaux.',
      icone: 'pi-users'
    },
    {
      chemin: '/admin/timeline',
      titre: 'Timeline',
      explication: 'L\'histoire de l\'association, chapitre par chapitre, avec les dates marquantes et leurs photos.',
      icone: 'pi-history'
    },
    {
      chemin: '/admin/partenaires',
      titre: 'Partenaires',
      explication: 'Les structures qui soutiennent THG, avec leur logo, leur description et leurs liens.',
      icone: 'pi-briefcase'
    },
    {
      chemin: '/admin/ambassadeurs',
      titre: 'Ambassadeurs',
      explication: 'Les créateurs et créatrices qui représentent THG, avec leur galerie de photos.',
      icone: 'pi-star'
    },
    {
      chemin: '/admin/reseaux-sociaux',
      titre: 'Réseaux sociaux',
      explication: 'Les liens X, Instagram et Discord de l\'association, affichés dans le pied de page et sur la page contact.',
      icone: 'pi-share-alt'
    },
    {
      chemin: '/admin/boutique',
      titre: 'Boutique',
      explication: 'Ouvrir ou fermer la boutique du site, et choisir la boutique HelloAsso affichée.',
      icone: 'pi-shopping-bag'
    },
    {
      chemin: '/admin/medias',
      titre: 'Médiathèque',
      explication: 'Toutes les images envoyées sur le site, au même endroit, avec leur utilisation.',
      icone: 'pi-images'
    }
  ];
}
