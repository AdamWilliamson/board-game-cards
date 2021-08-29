import { Component, ViewChild, QueryList, ElementRef } from '@angular/core';
import {
  BggGameServiceService,
  BGGThingResult,
} from './bgg-game-service.service';
import domtoimage from 'dom-to-image';
import { MatCard } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { LEADING_TRIVIA_CHARS } from '@angular/compiler/src/render3/view/template';

interface GameItem extends BGGThingResult {
  complexity: string;
  themes: Array<string>;
  type: string;
  mechanics: Array<string>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'board-game-cards';
  username = 'Mythical_Man84';
  gameCollection: Array<GameItem> = [];
  @ViewChild('cards') cardContainer: ElementRef<HTMLElement> | null = null;
  images: Array<HTMLImageElement> = [];
  imageUrls: Array<string> = [];
  imageLoadedCount = 0;
  loading = false;
  themes: Array<string> = [];
  mechanics: Array<string> = [];
  complexities = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
  types = ['VS', 'Cooperative', 'Interactive', 'Solitaire'].sort();
  editing = false;

  get pageWidth() {
    return '2480px';
  }

  get pageHeight() {
    return '3508px';
  }

  get cardWidth() {
    return '780px';
  }
  get cardHeight() {
    return '1039px';
  }

  get imageMaxHeight() {
    return Math.floor(Number.parseInt(this.cardHeight) / 2.5) + 'px';
  }

  readonly padding = 60;
  get imageMaxWidth() {
    return 780 - this.padding + 'px';
  }

  get titleModifiers() {
    return {
      high: true
    };
  }

  constructor(
    private http: HttpClient,
    private bggService: BggGameServiceService
  ) {
    let collectionJson = localStorage.getItem('collection');
    if (collectionJson) {
      this.gameCollection = JSON.parse(collectionJson);
      this.gameCollection.forEach((game) => {
        if (!game.themes) game.themes = [];
        if (!game.complexity) game.complexity = 'Moderate';
        if (!game.themes) game.themes = [];
        if (!game.type) game.type = "";
        if (!game.mechanics) game.mechanics = [];
      });
    }

    let themesJson = localStorage.getItem('themes');
    if (themesJson) {
      this.themes = JSON.parse(themesJson).sort();
    } else {
      this.themes = [
        'Wild West',
        'Gangster',
        'Super Heroes',
        'Martial Arts',
        'Pirates',
        'Racing',
        'Fantasy',
        'Trains',
        'Sports',
        'Economic',
        'Puzzle',
        'Sci Fi',
        'Terraforming',
        'Civilisation',
        'Silly',
        'Medieval',
        'Geography',
        'Business',
        'Horror',
        'Zombies',
        'Archaeology',
        'Racing',
        'Vikings',
        'Evolution',
        'Biology',
        'Farming',
        'Exploration',
        'Egyptian',
      ].sort();
    }

    let mechanicsJson = localStorage.getItem('mechanics');
    if (mechanicsJson) {
      this.mechanics = JSON.parse(mechanicsJson).sort();
    } else {
      this.mechanics = [
        'Area Control',
        'Engine Building',
        'Worker Placement',
        'Action Selection',
        'Strategy',
        'Set Collection',
        'Deck Building',
        'Tableau Building',
        'Traitor',
        'Pickup and Deliver',
        'Trading',
      ].sort();
    }
  }

  public loadCollection() {
    this.bggService
      .getUsersGames(this.username)
      .subscribe((data: Array<BGGThingResult>) => {

        let tempData = <GameItem[]>data;
        for(let game of tempData){
          let result = this.gameCollection.find(f => this.getCardTitle(f) == this.getCardTitle(game));
          if (result){
            game.themes = result.themes;
            game.complexity = result.complexity;
            game.type = result.type;
            game.mechanics = result.mechanics
          } else{
            game.themes = [];
            game.complexity = 'Moderate';
            game.themes = [];
            game.type = "";
          }
        }
        
        this.gameCollection = tempData;
        console.log(tempData);
        
        localStorage.setItem('collection', JSON.stringify(tempData));
      });
  }

  getCardTitle(item: BGGThingResult) {
    if (!item || !item.name) {
      return 'Failed To Load';
    }

    if (item.name.hasOwnProperty('0')) {
      return (<any>item.name)[0].attr.value;
    } else {
      return (<any>item.name).attr.value;
    }
  }

  getPlayerCount(item: BGGThingResult) {
    if (item.minplayers.attr.value == item.maxplayers.attr.value) {
      return item.minplayers.attr.value;
    } else {
      return `${item.minplayers.attr.value} - ${item.maxplayers.attr.value}`;
    }
  }

  imageLoaded() {
    this.imageLoadedCount++;
  }

  editSave(){
    if (this.editing){
      localStorage.setItem('collection', JSON.stringify(this.gameCollection));
    }
    this.editing = !this.editing;
  }
}
