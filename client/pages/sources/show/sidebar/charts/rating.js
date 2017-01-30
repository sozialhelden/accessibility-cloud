import { Template } from 'meteor/templating';
import './boolean.html';
import { _ } from 'lodash';
import * as d3 from 'd3';
import { interpolateRdYlGn } from 'd3-scale-chromatic';

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

  const bins = Object.keys(data).map(value => ({
    value,
    frequency: data[value],
  }));

  const x = d3.scaleLinear()
    .domain(d3.extent(bins, d => d.value))
    .range([0, WIDTH]);

  const y = d3.scaleLinear()
    .domain(d3.extent(bins, d => d.frequency))
    .range([HEIGHT, 0]);

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

  point.append('circle')
      .attr('r', 2)
      .attr('fill', d => interpolateRdYlGn(d.value))
      .append('title')
      .text(d => `${d.frequency} places have this attribute set to ${d.value}.`);
});
