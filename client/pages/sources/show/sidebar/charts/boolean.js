import { Template } from 'meteor/templating';
import './boolean.html';
import { _ } from 'lodash';
import * as d3 from 'd3';

const MARGIN = { top: 0, right: 25, bottom: 0, left: 5 };
const WIDTH = 80 - MARGIN.left - MARGIN.right;
const HEIGHT = 16 - MARGIN.top - MARGIN.bottom;

const GREEN = '#addc72';
const NEUTRAL_GRAY = '#ff6b7b';
const RED = '#dee1e7';

Template.sources_show_page_boolean_chart.onRendered(function rendered() {
  const chart = d3.select(this.find('svg.chart'))
    .attr('width', WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
  .append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  const attributeDistribution = this.data.attributeDistribution;
  const distributionAsObject = _.get(attributeDistribution, this.data.attributeName);
  if (!distributionAsObject) {
    return;
  }

  const numberOfPlaces = this.data.placeInfoCount;
  const numberOfPlacesWithoutKnownValue = (numberOfPlaces &&
    numberOfPlaces - (distributionAsObject.true || 0) - (distributionAsObject.false || 0)
  ) || 0;

  let offsetX = 0; // For positioning stacked bars
  const distributionAsArray = [
    { name: 'true', value: distributionAsObject.true, color: GREEN },
    { name: 'unknown', value: numberOfPlacesWithoutKnownValue, color: NEUTRAL_GRAY },
    { name: 'false', value: distributionAsObject.false, color: RED },
  ].map(d => {
    const result = Object.assign({ offsetX }, d);
    offsetX += d.value;
    return result;
  });

  const x = d3.scaleLinear()
    .domain([0, numberOfPlaces])
    .range([0, WIDTH]);

  const rect = chart.selectAll('.rect')
    .data(distributionAsArray)
  .enter()
    .append('g')
    .attr('class', 'rect');

  rect.append('rect')
    .attr('fill', d => d.color)
    .attr('x', d => x(d.offsetX))
    .attr('height', HEIGHT)
    .attr('width', d => (d.value ? x(d.value) : 0))
    .append('title')
    .text(d => `${d.value} places have this attribute set to '${d.name}'.`);
});
