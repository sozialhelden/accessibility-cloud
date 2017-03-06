# AXSMaps
Some notes on the API import-format of Jaccede

## example-places
- https://www.jaccede.com/en/p/ChIJ8ect1eRZn0cRDRnpqH-ZzeI/hotel-novotel-nuernberg-messezentrum?page=1
- [A sample place-details page](https://www.jaccede.com/en/p/ChIJN6uWRp68rhIRC9VoO58Xhso/hotel-albert-1er-toulouse)

## References
- [Mapping Jaccede Properties](https://docs.google.com/spreadsheets/d/1D-RwYeTm8eDN95R4pDAJUWn8n_FY4QlMnbQAfj6Z6dc/edit#gid=2140391884)
- [API reference](http://apidoc.jaccede.com/#/places/get)

## Considerations

- Excellent depths and good starting point for existing and relevant data.
- Extendible data structure

### Needs attention

- Sometimes incorrect to misleading translations.
- Extensive and hard to read json-format for nested data.
- mixes precise data-attribes with interpretation
- mixes boolean attributes with clarifications inside child-attributes
- mixes float properties with booleans (less than, more then, precisely)
- Floods response with undefined data like...

    "parkings": false,
    "picture": false,
    "selected": false,

- Default response language is French.
- switches between possitive and negative properties: "door.easyToHoldOpen" vs. "door.difficultToHoldOpen"
- has contradicting properties "services/equipment/foldingSeat" vs. "rooms/restroom/shower/showerSeat/fix/folds/Down"

## Formatted Sample Object

    {
          "items": [
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [],
                      "description": "Aucune diff\u00e9rence de niveau entre l'ext\u00e9rieur et l'int\u00e9rieur",
                      "id": 4,
                      "label": "De plain-pied",
                      "parkings": false,
                      "picture": false,
                      "selected": true,
                      "type": "option"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": "Petite marche d'une hauteur maximum de 2 cm",
                          "id": 5,
                          "label": "Avec ressaut",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [
                            {
                              "children": [
                                {
                                  "children": [],
                                  "description": null,
                                  "id": 16,
                                  "label": "1",
                                  "parkings": false,
                                  "picture": false,
                                  "selected": false,
                                  "type": "option"
                                },
                                {
                                  "children": [],
                                  "description": null,
                                  "id": 17,
                                  "label": "2",
                                  "parkings": false,
                                  "picture": false,
                                  "selected": false,
                                  "type": "option"
                                },
                                {
                                  "children": [],
                                  "description": null,
                                  "id": 18,
                                  "label": "3",
                                  "parkings": false,
                                  "picture": false,
                                  "selected": false,
                                  "type": "option"
                                },
                                {
                                  "children": [],
                                  "description": null,
                                  "id": 19,
                                  "label": "plus de 3",
                                  "parkings": false,
                                  "picture": false,
                                  "selected": false,
                                  "type": "option"
                                }
                              ],
                              "description": null,
                              "id": 11,
                              "label": "Nombre de marches",
                              "parkings": false,
                              "picture": false,
                              "type": "enum"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 12,
                              "label": "Hauteur de marche (cm)",
                              "parkings": false,
                              "picture": false,
                              "type": "float",
                              "value": null
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 13,
                              "label": "Main courante",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "boolean"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 14,
                              "label": "Nez de marches contrast\u00e9s et antid\u00e9rapants",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "boolean"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 15,
                              "label": "Bande d'\u00e9veil \u00e0 la vigilance",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "boolean"
                            }
                          ],
                          "description": null,
                          "id": 6,
                          "label": "Marche(s) / escaliers",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 7,
                          "label": "Plan inclin\u00e9",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 8,
                          "label": "Rampe amovible (disponible sur demande)",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 9,
                          "label": "\u00c9l\u00e9vateur",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 10,
                          "label": "Bouton d'appel",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        }
                      ],
                      "description": null,
                      "id": 237,
                      "label": "Pas de plein pied",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    }
                  ],
                  "description": null,
                  "id": 3,
                  "label": "Acc\u00e8s",
                  "parkings": false,
                  "picture": false,
                  "type": "enum"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 20,
                  "label": "Enseigne visible et lisible",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 21,
                  "label": "L\u2019entr\u00e9e \u00e9valu\u00e9e est l'entr\u00e9e principale",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 22,
                  "label": "Visiteur visible depuis l'int\u00e9rieur",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 27,
                      "label": "Entre 90 et 120 cm du sol ",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 28,
                      "label": "Contrast\u00e9 par rapport au mur",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 23,
                  "label": "Interphone",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": "Si la porte est vitr\u00e9e, une bande ou un motif d'au moins 5 cm doit \u00eatre plac\u00e9 \u00e0 110 et 160 cm du sol",
                  "id": 24,
                  "label": "Marquage sur porte vitr\u00e9e",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 29,
                      "label": "Automatique",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": "Exclut les poign\u00e9es rondes",
                          "id": 31,
                          "label": "Poign\u00e9e ergonomique",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 32,
                          "label": "Porte facile \u00e0 maintenir ouverte",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        }
                      ],
                      "description": null,
                      "id": 30,
                      "label": "Manuelle",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    }
                  ],
                  "description": null,
                  "id": 25,
                  "label": "Ouverture de porte",
                  "parkings": false,
                  "picture": false,
                  "type": "enum"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 33,
                      "label": "90 cm et plus",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 236,
                          "label": "Pr\u00e9cisez",
                          "parkings": false,
                          "picture": false,
                          "type": "float",
                          "value": null
                        }
                      ],
                      "description": null,
                      "id": 34,
                      "label": "moins de 90 cm",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    }
                  ],
                  "description": null,
                  "id": 26,
                  "label": "Largeur du passage de la porte d'entr\u00e9e (cm)",
                  "parkings": false,
                  "picture": false,
                  "type": "enum"
                }
              ],
              "description": null,
              "id": 2,
              "label": "Entr\u00e9e",
              "parkings": false,
              "picture": true,
              "type": "array"
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 234,
                      "label": "Proche de l'entr\u00e9e",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 235,
                      "label": "Hauteur adapt\u00e9e",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 36,
                  "label": "Guichet d'accueil",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 47,
                      "label": "Contrast\u00e9e visuellement",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 37,
                  "label": "Bande de guidage tactile jusqu\u2019au guichet d'accueil",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 39,
                  "label": "Mobilier amovible",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 48,
                      "label": "En relief",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 49,
                      "label": "Aux contrastes renforc\u00e9s",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 50,
                      "label": "En braille",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 51,
                      "label": "En gros caract\u00e8res",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 40,
                  "label": "Plan du lieu proche de l'entr\u00e9e",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": "Gros caract\u00e8res contrast\u00e9s, compr\u00e9hensibles et homog\u00e8nes Fl\u00e9chage sans interruption",
                  "id": 43,
                  "label": "Les panneaux sont compr\u00e9hensibles et lisibles",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 44,
                  "label": "Espace bruyant",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": "Aucune marche et largeur de passage d'au moins 90 cm",
                      "id": 52,
                      "label": "Total",
                      "parkings": false,
                      "picture": false,
                      "selected": true,
                      "type": "option"
                    },
                    {
                      "children": [],
                      "description": "Certaines sections des lieux sont inaccessibles en fauteuil roulant",
                      "id": 53,
                      "label": "Partiel",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    }
                  ],
                  "description": null,
                  "id": 45,
                  "label": "Acc\u00e8s en fauteuil roulant",
                  "parkings": false,
                  "picture": false,
                  "type": "enum"
                },
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [
                            {
                              "children": [],
                              "description": null,
                              "id": 60,
                              "label": "Grand",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "option"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 61,
                              "label": "Standard (110 x 130 cm)",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "option"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 62,
                              "label": "Petit",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "option"
                            }
                          ],
                          "description": null,
                          "id": 56,
                          "label": "Dimensions de la cabine",
                          "parkings": false,
                          "picture": false,
                          "type": "enum"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 57,
                          "label": "Annonce vocale des \u00e9tages",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [
                            {
                              "children": [],
                              "description": null,
                              "id": 63,
                              "label": "en relief",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "boolean"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 64,
                              "label": "en braille",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "boolean"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 65,
                              "label": "contrast\u00e9s",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "boolean"
                            }
                          ],
                          "description": null,
                          "id": 58,
                          "label": "Sur les commandes, les chiffres sont",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 59,
                          "label": "Commandes \u00e0 hauteur de fauteuil roulant",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        }
                      ],
                      "description": null,
                      "id": 54,
                      "label": "Ascenseur(s)",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [
                        {
                          "children": [
                            {
                              "children": [],
                              "description": null,
                              "id": 71,
                              "label": "1",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "option"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 72,
                              "label": "2",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "option"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 73,
                              "label": "3",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "option"
                            },
                            {
                              "children": [],
                              "description": null,
                              "id": 74,
                              "label": "plus de 3",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "option"
                            }
                          ],
                          "description": null,
                          "id": 66,
                          "label": "Nombre de marches",
                          "parkings": false,
                          "picture": false,
                          "type": "enum"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 67,
                          "label": "Hauteur de marche (cm)",
                          "parkings": false,
                          "picture": false,
                          "type": "float",
                          "value": null
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 68,
                          "label": "Main courante",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": "Le nez de marche est la partie saillante de la marche",
                          "id": 69,
                          "label": "Nez de marches contrast\u00e9s et antid\u00e9rapants",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 70,
                          "label": "Bande d'\u00e9veil \u00e0 la vigilance",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        }
                      ],
                      "description": null,
                      "id": 55,
                      "label": "Marche(s) / escaliers",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 46,
                  "label": "Il y a plusieurs niveaux",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                }
              ],
              "description": null,
              "id": 35,
              "label": "Int\u00e9rieur",
              "parkings": false,
              "picture": true,
              "type": "array"
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [],
                      "description": "Aucune diff\u00e9rence de niveau entre l'ext\u00e9rieur et l'int\u00e9rieur des sanitaires. Largeur de porte d'au moins 90 cm, aire de man\u0153uvre de 150 cm, barre d'appui.",
                      "id": 126,
                      "label": "De plain-pied et am\u00e9nag\u00e9s",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 127,
                      "label": "De plain-pied, sans am\u00e9nagement",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 128,
                      "label": "Marche(s)",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    }
                  ],
                  "description": null,
                  "id": 76,
                  "label": "Sanitaires",
                  "parkings": false,
                  "picture": true,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 129,
                      "label": "Douche \u00e0 l'italienne",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 130,
                      "label": "Barre(s) d'appui dans la douche",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 133,
                          "label": "amovible",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "option"
                        },
                        {
                          "children": [
                            {
                              "children": [],
                              "description": null,
                              "id": 135,
                              "label": "abattable",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "boolean"
                            }
                          ],
                          "description": null,
                          "id": 134,
                          "label": "fixe",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "option"
                        }
                      ],
                      "description": null,
                      "id": 131,
                      "label": "Si\u00e8ge de douche",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 77,
                  "label": "Douche",
                  "parkings": false,
                  "picture": true,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 136,
                      "label": "Possibilit\u00e9 de s'asseoir",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 137,
                      "label": "Barre(s) d'appui",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 138,
                      "label": "Aire de man\u0153uvre d'au moins 150 cm de diam\u00e8tre",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 140,
                          "label": "\u00e0 code",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "option"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 141,
                          "label": "\u00e0 cl\u00e9",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "option"
                        }
                      ],
                      "description": null,
                      "id": 139,
                      "label": "Casiers",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 78,
                  "label": "Vestiaires",
                  "parkings": false,
                  "picture": true,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 147,
                      "label": "Service \u00e0 la table possible",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": "Espace sous les tables de 70 cm de haut, 80 cm de large et 50 cm de profondeur",
                      "id": 148,
                      "label": "Tables accessibles",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 80,
                  "label": "Cantine",
                  "parkings": false,
                  "picture": true,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 150,
                      "label": "Visuelle",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 151,
                      "label": "Auditive",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 152,
                      "label": "Intellectuelle",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 153,
                      "label": "Motrice",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 82,
                  "label": "Visites et/ou activit\u00e9s adapt\u00e9es aux personnes ayant une d\u00e9ficience",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 157,
                          "label": "\u00e0 moins de 120 cm de haut",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 158,
                          "label": "en relief",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 159,
                          "label": "en braille",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 160,
                          "label": "en gros caract\u00e8res",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        }
                      ],
                      "description": null,
                      "id": 154,
                      "label": "Commandes",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 155,
                      "label": "Aide auditive pour les personnes malvoyantes",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 156,
                      "label": "Facile d\u2019utilisation",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 83,
                  "label": "Automates",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 84,
                  "label": "Lecteur de carte bancaire sans fil portable",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 85,
                  "label": "V\u00e9hicule(s) adapt\u00e9(s)",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 163,
                      "label": "Pour le handicap moteur",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 164,
                      "label": "Pour le handicap mental",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 165,
                      "label": "Pour le handicap auditif",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 166,
                      "label": "Pour le handicap visuel",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 88,
                  "label": "Dispose du label Tourisme et Handicap",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 93,
                  "label": "Places r\u00e9serv\u00e9es aux personnes en fauteuil roulant",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": "Espace sous les tables de 70 cm de haut, 80 cm de large et 50 cm de profondeur",
                  "id": 95,
                  "label": "Tables accessibles",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 98,
                  "label": "Personnel initi\u00e9 \u00e0 la langue des signes",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 99,
                  "label": "Personnel form\u00e9 \u00e0 l'accueil des personnes en situation de handicap",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 103,
                  "label": "Caisses \u00e0 hauteur adapt\u00e9e",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 172,
                      "label": "Fauteuil roulant manuel",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 173,
                      "label": "Si\u00e8ge pliable",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 174,
                      "label": "Si\u00e8ge de douche",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 175,
                      "label": "Lit \u00e0 hauteur ajustable",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 176,
                      "label": "L\u00e8ve-personne",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 177,
                      "label": "Dispositif de mise \u00e0 l'eau",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 178,
                      "label": "Rehausse WC",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 179,
                      "label": "Fauteuil tout terrain",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 185,
                          "label": "Faciles \u00e0 utiliser et \u00e0 comprendre",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        }
                      ],
                      "description": null,
                      "id": 180,
                      "label": "Audioguides",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 181,
                      "label": "Table \u00e0 langer",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 182,
                      "label": "Chaise haute pour enfant",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 184,
                          "label": "Pr\u00e9cisez",
                          "parkings": false,
                          "picture": false,
                          "type": "string",
                          "value": null
                        }
                      ],
                      "description": null,
                      "id": 183,
                      "label": "Autre",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 104,
                  "label": "Mat\u00e9riel \u00e0 disposition",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                }
              ],
              "description": null,
              "id": 75,
              "label": "Services et \u00e9quipements",
              "parkings": false,
              "picture": false,
              "type": "array"
            },
            {
              "children": [
                {
                  "children": [],
                  "description": null,
                  "id": 108,
                  "label": "Nombre de chambres accessibles annonc\u00e9",
                  "parkings": false,
                  "picture": false,
                  "type": "integer",
                  "value": null
                },
                {
                  "children": [],
                  "description": null,
                  "id": 112,
                  "label": "Circulation ais\u00e9e jusqu'\u00e0 la chambre",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 113,
                  "label": "Num\u00e9ro de la chambre en relief / en braille",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 186,
                      "label": "90 cm et plus",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 188,
                          "label": "Pr\u00e9cisez",
                          "parkings": false,
                          "picture": false,
                          "type": "float",
                          "value": null
                        }
                      ],
                      "description": null,
                      "id": 187,
                      "label": "moins de 90 cm",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "option"
                    }
                  ],
                  "description": null,
                  "id": 114,
                  "label": "Largeur du passage de la porte (cm)",
                  "parkings": false,
                  "picture": false,
                  "type": "enum"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 115,
                  "label": "Porte l\u00e9g\u00e8re et poign\u00e9e ergonomique",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 189,
                      "label": "Devant la penderie",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 190,
                      "label": "Devant la porte de la chambre",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 191,
                      "label": "Devant la porte de la salle de bain",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 116,
                  "label": "Aire de man\u0153uvre d'au moins 150 cm",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 117,
                  "label": "Espace de 90 cm de largeur au moins d\u2019un c\u00f4t\u00e9 du lit",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 118,
                  "label": "Espace d\u2019au moins 20 cm de haut sous le lit",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 119,
                  "label": "Hauteur de lit en cm (matelas inclu)",
                  "parkings": false,
                  "picture": false,
                  "type": "float",
                  "value": null
                },
                {
                  "children": [],
                  "description": null,
                  "id": 120,
                  "label": "Tringle de penderie ou \u00e9tag\u00e8res \u00e0 moins de 120 cm du sol",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 122,
                  "label": "Alarme incendie clignotante",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [],
                  "description": null,
                  "id": 123,
                  "label": "Interrupteur et prises de courant contrast\u00e9s",
                  "parkings": false,
                  "picture": false,
                  "selected": false,
                  "type": "boolean"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": null,
                      "id": 192,
                      "label": "Acc\u00e8s de plain-pied",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 193,
                      "label": "Porte difficile \u00e0 maintenir ouverte",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 204,
                          "label": "90 cm et plus",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "option"
                        },
                        {
                          "children": [
                            {
                              "children": [],
                              "description": null,
                              "id": 206,
                              "label": "Pr\u00e9cisez",
                              "parkings": false,
                              "picture": false,
                              "type": "float",
                              "value": null
                            }
                          ],
                          "description": null,
                          "id": 205,
                          "label": "moins de 90 cm",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "option"
                        }
                      ],
                      "description": null,
                      "id": 194,
                      "label": "Largeur du passage de la porte (cm)",
                      "parkings": false,
                      "picture": false,
                      "type": "enum"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 195,
                      "label": "Aire de man\u0153uvre d'au moins 150 cm",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 196,
                      "label": "Zone de transfert \u00e0 c\u00f4t\u00e9 des toilettes",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 207,
                          "label": "Standard (entre 40 et 45 cm)",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "option"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 208,
                          "label": "Haute (sup\u00e9rieure \u00e0 45 cm)",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "option"
                        }
                      ],
                      "description": null,
                      "id": 197,
                      "label": "Hauteur de l'assise des toilettes",
                      "parkings": false,
                      "picture": false,
                      "type": "enum"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 198,
                      "label": "Barre(s) d'appui ",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 199,
                      "label": "Lavabo adapt\u00e9 ",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 200,
                      "label": "Savon et s\u00e8che-main entre 90 et 120 cm du sol",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 201,
                      "label": "Base du miroir \u00e0 maximum 1m du sol",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 202,
                      "label": "Baignoire",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 209,
                          "label": "Douche \u00e0 l'italienne",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [],
                          "description": null,
                          "id": 210,
                          "label": "Barre(s) d'appui dans la douche",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        },
                        {
                          "children": [
                            {
                              "children": [],
                              "description": null,
                              "id": 212,
                              "label": "amovible",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "boolean"
                            },
                            {
                              "children": [
                                {
                                  "children": [],
                                  "description": null,
                                  "id": 214,
                                  "label": "abattable",
                                  "parkings": false,
                                  "picture": false,
                                  "selected": false,
                                  "type": "boolean"
                                }
                              ],
                              "description": null,
                              "id": 213,
                              "label": "fixe",
                              "parkings": false,
                              "picture": false,
                              "selected": false,
                              "type": "boolean"
                            }
                          ],
                          "description": null,
                          "id": 211,
                          "label": "Si\u00e8ge de douche",
                          "parkings": false,
                          "picture": false,
                          "type": "enum"
                        }
                      ],
                      "description": null,
                      "id": 203,
                      "label": "Douche",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 124,
                  "label": "Salle de bain",
                  "parkings": false,
                  "picture": true,
                  "selected": false,
                  "type": "boolean"
                }
              ],
              "description": null,
              "id": 107,
              "label": "Chambre(s)",
              "parkings": false,
              "picture": false,
              "type": "array"
            },
            {
              "children": [
                {
                  "children": [
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 232,
                          "label": "plus grande que les autres places",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        }
                      ],
                      "description": null,
                      "id": 230,
                      "label": "\u00e0 proximit\u00e9 de l'\u00e9tablissement",
                      "parkings": true,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [
                        {
                          "children": [],
                          "description": null,
                          "id": 233,
                          "label": "plus grande que les autres places",
                          "parkings": false,
                          "picture": false,
                          "selected": false,
                          "type": "boolean"
                        }
                      ],
                      "description": null,
                      "id": 231,
                      "label": "dans l'enceinte de l'\u00e9tablissement",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": "Panneaux et marquages au sol indiquant une interdiction de stationner, sauf pour les personnes en situation de handicap",
                  "id": 223,
                  "label": "Place de stationnement \"handicap\u00e9\"",
                  "parkings": false,
                  "picture": false,
                  "type": "array"
                },
                {
                  "children": [
                    {
                      "children": [],
                      "description": "Hauteur du trottoir abaiss\u00e9e au niveau des passages pi\u00e9tons",
                      "id": 225,
                      "label": "Abaiss\u00e9s \u00e0 proximit\u00e9",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 226,
                      "label": "Pav\u00e9s",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 227,
                      "label": "Tr\u00e8s \u00e9troits",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 228,
                      "label": "D\u00e9vers important",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    },
                    {
                      "children": [],
                      "description": null,
                      "id": 229,
                      "label": "Rue en pente",
                      "parkings": false,
                      "picture": false,
                      "selected": false,
                      "type": "boolean"
                    }
                  ],
                  "description": null,
                  "id": 224,
                  "label": "Trottoirs",
                  "parkings": false,
                  "picture": false,
                  "type": "array"
                }
              ],
              "description": null,
              "id": 222,
              "label": "Ext\u00e9rieur",
              "parkings": false,
              "picture": false,
              "type": "array"
            }
          ]
        }
