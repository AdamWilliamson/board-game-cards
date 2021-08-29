import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, throwError, of, timer, iif, from } from 'rxjs';
import {
  catchError,
  retry,
  retryWhen,
  delayWhen,
  map,
  tap,
  mergeMap,
  finalize,
  concatMap,
  delay,
} from 'rxjs/operators';
import * as parser from 'fast-xml-parser';

export interface BGGCollectionResult {
  name: string;
  yearpublished: Number;
  image: string;
  thumbnail: string;
  status: string;
  numplays: number;
  attr: {
    objectid: string;
  };
}

export interface BGGThingResult {
  name:
    | {
        [id: string]: {
          attr: {
            value: string;
          };
        };
      }
    | {
        attr: {
          value: string;
        };
      };

  yearpublished: Number;
  image: string;
  thumbnail: string;
  status: string;
  numplays: number;
  minplayers: { attr: { value: string } };
  maxplayers: { attr: { value: string } };
  playingtime: { attr: { value: string } };
}

@Injectable({
  providedIn: 'root',
})
export class BggGameServiceService {
  constructor(private http: HttpClient) {}

  public getUsersGames(
    username: string //
  ): Observable<Array<BGGThingResult>> {
    var xmlParserOptions = {
      attributeNamePrefix: '',
      attrNodeName: 'attr',
      ignoreAttributes: false,
      allowBooleanAttributes: true,
    };

    return this.http
      .get('https://www.boardgamegeek.com/xmlapi2/collection', {
        responseType: 'text',
        observe: 'response',
        params: {
          username: username,
          subtype: 'boardgame',
          own: '1',
          excludesubtype: 'boardgameexpansion',
        },
      })
      .pipe(
        mergeMap((response, i) => {
          if (response.status === 202) {
            throw 'loading data';
          }

          if (response.body && parser.validate(response.body) === true) {
            var jsonObj = parser.parse(response.body, xmlParserOptions);
            return this.http
              .get('https://api.geekdo.com/xmlapi2/thing', {
                responseType: 'text',
                observe: 'response',
                params: {
                  id: jsonObj.items.item
                    .map((f: { attr: { objectid: String } }) => f.attr.objectid)
                    .join(','),
                },
              })
              .pipe(
                map<HttpResponse<string>, Array<BGGThingResult>>(
                  (response, i) => {
                    //return response;
                    if (response.status === 202) {
                      throw 'loading data';
                    }

                    if (
                      response.body &&
                      parser.validate(response.body) === true
                    ) {
                      var jsonObj = parser.parse(
                        response.body,
                        xmlParserOptions
                      );

                      return <Array<BGGThingResult>>jsonObj.items.item;
                    } else {
                      throw 'invalid data';
                    }
                  }
                ),
                retryWhen((errors) =>
                  errors.pipe(
                    mergeMap((error, i) => {
                      if (i + 1 >= 5) {
                        return throwError(error);
                      }
                      return timer(1000);
                    }),
                    finalize(() => console.log('We are done!'))
                  )
                )
                //catchError((err) => from(new Array<BGGThingResult>()))
              );
          } else {
            throw 'invalid data';
          }
        }),
        // retryWhen((errors) =>
        //   errors.pipe(
        //     mergeMap((error, i) => {
        //       if (i + 1 >= 5) {
        //         return throwError(error);
        //       }
        //       return timer(1000);
        //     }),
        //     finalize(() => console.log('We are done!'))
        //   )
        // ),
        // catchError((err, caught) => {
        //   console.log(err);
        //   return from(new Array<BGGThingResult>());
        // })
      );
  }
}
