import { Template } from 'meteor/templating';
import './boolean.html';
import { _ } from 'lodash';
import * as d3 from 'd3';
import { interpolateRdYlGn } from 'd3-scale-chromatic';
import { NEUTRAL_GRAY, GREEN } from './colors';

const MARGIN = { top: 10, right: 25, bottom: 20, left: 60 };
const WIDTH = 200 - MARGIN.left - MARGIN.right;
const HEIGHT = 80 - MARGIN.top - MARGIN.bottom;

Template.sources_show_page_rating_chart.onRendered(function rendered() {
  const chart = d3.select(this.find('svg.chart'))
    .attr('width', WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
  .append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  const attributeDistribution = this.data.attributeDistribution;
  const data = _.get(attributeDistribution, this.data.attributeName);

  const values = Object.keys(data);
  const bins = values.map(value => ({
    value,
    frequency: data[value],
  }));
  const maxFrequency = d3.max(bins, d => d.frequency);
  const hasNumericValuesOnly = _.every(values, v => _.isFinite(Number(v)));
  const xScale = hasNumericValuesOnly ?
    d3.scaleLinear().domain(d3.extent(bins, d => d.value)) :
    d3.scaleBand().domain(values).padding(0.25);

  const x = xScale.range([0, WIDTH]);
  const y = d3.scaleLinear().domain([0, maxFrequency]).range([HEIGHT, 0]);

  const normalizedY = d3.scaleLinear().domain([0, maxFrequency]).range([0, 1]);
  const fillScale = this.data.attributeName.match(/rating/i) ?
    interpolateRdYlGn :
    v => {
      const normY = normalizedY(v);
      return isNaN(normY) ? NEUTRAL_GRAY : GREEN;
    }

  chart.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${HEIGHT})`)
    .call(d3.axisBottom(x).ticks(4));

  chart.append('g')
    .attr('class', 'axis axis-y')
    .call(d3.axisLeft(y).ticks(3));

  const point = chart.selectAll('.point')
    .data(bins)
  .enter()
    .append('g')
    .attr('class', 'point')
    .attr('transform', d => `translate(${x(d.value)},${y(d.frequency)})`);

  // point.append('circle')
  //     .attr('r', 2)

  point.append('rect')
    .attr('x', d => x(d) - (x.bandwidth ? 0 : 2.5))
    .attr('y', 0)
    .attr('fill', d => fillScale(d.value))
    .attr('width', x.bandwidth ? x.bandwidth() : 5)
    .attr('height', d => HEIGHT - y(d.frequency))
  .append('title')
    .text(d => `${d.frequency} places have this attribute set to ${d.value}.`);
});
