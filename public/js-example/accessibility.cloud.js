AccessibilityCloud = {
  getPlacesAround: function getPlacesAround(parameters) {
    return $.ajax({
      dataType: 'json',
      url: 'http://localhost:3000/place-infos',
      data: parameters,
      headers: {
        Accept: 'application/json',
        'X-Token': this.token,
      },
    });
  },

  renderPlaces: function renderPlaces(element, parameters) {
    this.getPlacesAround(parameters)
      .done(function handleResponse(response) {
        $(element).text(JSON.stringify(response.features));
      })
      .fail(function handleError(error) {
        $(element).html('<div class="error">Could not load data: ' + error.message + '</div>');
      });
  },
};
