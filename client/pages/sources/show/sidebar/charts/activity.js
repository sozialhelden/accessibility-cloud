import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import * as d3 from 'd3';
import subsManager from '/client/lib/subs-manager';
import { SourceImports } from '/both/api/source-imports/source-imports';
import './activity.html';
import { GREEN, YELLOW, NEUTRAL_GRAY } from './colors';

const MARGIN = { top: 10, right: 25, bottom: 20, left: 60 };
const WIDTH = 280 - MARGIN.left - MARGIN.right;
const HEIGHT = 80 - MARGIN.top - MARGIN.bottom;
const BAR_WIDTH = 6;

Template.sources_show_page_activity_chart.onCreated(() => {
  subsManager.subscribe('sourceImports.public');
});

Template.sources_show_page_activity_chart.onRendered(function rendered() {
  const chart = d3.select(this.find('svg.chart'))
    .attr('width', WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
  .append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  chart.append('g').attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${HEIGHT})`);
  chart.append('g').attr('class', 'axis axis-y');

  this.autorun(() => {
    const imports = SourceImports.find({ sourceId: this.data._id }).fetch();
    if (!imports.length) {
      return;
    }

    const timeExtent = [
      new Date(d3.min(imports, d => d.startTimestamp)),
      new Date(),
    ];
    const x = d3.scaleTime()
      .domain(timeExtent)
      .range([0, WIDTH]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(imports, sourceImport => {
        const afterImport = sourceImport.placeInfoCountAfterImport || 0;
        const inserted = sourceImport.insertedPlaceInfoCount || 0;
        const updated = sourceImport.insertedPlaceInfoCount || 0;
        const processed = sourceImport.processedPlaceInfoCount || 0;
        return d3.max([processed, afterImport, inserted + updated]);
      })])
      .range([HEIGHT, 0]);

    chart.select('g.axis-x').call(d3.axisBottom(x).ticks(2));
    chart.select('g.axis-y').call(d3.axisLeft(y).ticks(3));

    const bar = chart.selectAll('.bar')
      .data(imports)
      .enter()
    .append('g')
      .attr('class', 'bar')
      .attr('transform', d => `translate(${x(new Date(d.startTimestamp))},0)`);

    bar.append('rect')
      .attr('class', 'processed')
      .attr('x', 0.5 * BAR_WIDTH)
      .attr('y', d => y(d.processedPlaceInfoCount))
      .attr('width', BAR_WIDTH)
      .attr('height', d => HEIGHT - y(d.processedPlaceInfoCount))
      .attr('fill', NEUTRAL_GRAY)
    .append('title')
      .text(d => `${d.processedPlaceInfoCount} input records processed ${moment(d.startTimestamp).fromNow()}`);

    bar.append('rect')
      .attr('class', 'inserted')
      .attr('x', 0.5 * BAR_WIDTH)
      .attr('y', d => y(d.insertedPlaceInfoCount))
      .attr('width', BAR_WIDTH)
      .attr('height', d => HEIGHT - y(d.insertedPlaceInfoCount))
      .attr('fill', GREEN)
    .append('title')
      .text(d => `${d.insertedPlaceInfoCount} places inserted ${moment(d.startTimestamp).fromNow()}`);

    bar.append('rect')
      .attr('class', 'updated')
      .attr('x', 0.5 * BAR_WIDTH)
      .attr('y', d => y(d.updatedPlaceInfoCount + d.insertedPlaceInfoCount))
      .attr('width', BAR_WIDTH)
      .attr('height', d => HEIGHT - y(d.updatedPlaceInfoCount))
      .attr('fill', YELLOW)
    .append('title')
      .text(d => `${d.updatedPlaceInfoCount} places updated ${moment(d.startTimestamp).fromNow()}`);

  });
});
