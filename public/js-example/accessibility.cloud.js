(function () {
  window.AccessibilityCloud = {
    getPlacesAround: function (parameters) {
      return $.ajax({
        dataType: 'json',
        url: 'http://localhost:3000/place-infos?includeRelated=source',
        data: parameters,
        headers: {
          Accept: 'application/json',
          'X-Token': this.token,
        },
      });
    },

    resultsTemplate: function () {
      // TODO: Finish + test area accessibility attributes
      // Template format: https://github.com/janl/mustache.js
      // eslint-disable-next-line no-multi-str
      return '<ul class="ac-result-list" role="treegrid"> \
        {{#places}} \
          <li class="ac-result" role="gridcell" aria-expanded="false"> \
            {{#properties}} \
              <img src="https://dl.dropboxusercontent.com/u/5503063/ac/icons/{{category}}.png" role="presentation"> \
              <header class="ac-result-name" role="heading">{{name}}</header> \
              <div class="ac-result-category">{{category}}</div> \
              <a href="{{detailsURL}}" class="ac-result-link">{{sourceName}}</a> \
              <div class="ac-result-distance">{{formattedDistance}}</div> \
              <div class="ac-result-accessibility">Accessibility: {{formattedAccessibility}}</div> \
            {{/properties}} \
          </li> \
        {{/places}} \
      </ul>';
    },

    renderPlaces: function (element, places, related) {
      // $(element).text(JSON.stringify(response.features));
      var self = this;
      if (!$(element).length) {
        console.error('Could not render results, element not found.');
      }
      if (places && places.length) {
        $(element).html(Mustache.render(self.resultsTemplate(), {
          places: places,
          formattedDistance: function () {
            return Math.round(this.distance) + 'm';
          },
          formattedAccessibility: function () {
            // TODO: Introduce 'real' formatting here
            return JSON.stringify(this.accessibility, true, 2)
              .replace(/(\s*\[\n)|([\{\}\[\]",]*)/g, '')
              .replace(/\n\s\s/g, '\n');
          },
          sourceName: function () {
            var source = related.Sources && related.Sources[this.sourceId];
            return source && source.name;
          },
        }));
      } else {
        $(element).html('<div class="ac-no-results">No results.</div>');
      }
    },

    loadAndRenderPlaces: function (element, parameters) {
      var self = this;

      return this.getPlacesAround(parameters)
        .done(function handleResponse(response) {
          self.renderPlaces(element, response.features, response.related);
        })
        .fail(function handleError(error) {
          var message = (error && error.message) || 'No error message';
          $(element)
            .append('<div class="ac-error"></div>')
            .text('Could not load data: ' + message);
        });
    },
  };
}());
