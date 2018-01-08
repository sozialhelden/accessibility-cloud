import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import * as d3 from 'd3';
import { SourceImports } from '/both/api/source-imports/source-imports';
import subsManager from '/client/lib/subs-manager';
import './activity.html';

import { GREEN, YELLOW, NEUTRAL_GRAY } from './colors';

const TYPES_TO_COLORS = {
  processed: NEUTRAL_GRAY,
  inserted: GREEN,
  updated: YELLOW,
};

const MARGIN = { top: 10, right: 25, bottom: 20, left: 60 };
const WIDTH = 280 - MARGIN.left - MARGIN.right;
const HEIGHT = 80 - MARGIN.top - MARGIN.bottom;
const BAR_WIDTH = 6;

Template.sources_show_page_activity_chart.onCreated(() => {
  const source = Template.instance().data;
  subsManager.subscribe('sourceImports.public');
  subsManager.subscribe('sourceImports.private', source._id);
  subsManager.subscribe('sourceImports.stats.public', source._id);
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

    if (!subsManager.ready()) {
      return;
    }

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
        const afterImport = sourceImport.DocumentCountAfterImport || 0;
        const inserted = sourceImport.insertedDocumentCount || 0;
        const updated = sourceImport.insertedDocumentCount || 0;
        const processed = sourceImport.processedDocumentCount || 0;
        return d3.max([processed, afterImport, inserted + updated]);
      })])
      .range([HEIGHT, 0]);

    chart.select('g.axis-x').call(d3.axisBottom(x).ticks(2));
    chart.select('g.axis-y').call(d3.axisLeft(y).ticks(3));

    const enteringBar = chart.selectAll('.bar')
      .data(imports)
      .enter()
    .append('g')
      .attr('class', 'bar');

    ['inserted', 'processed', 'updated'].forEach(type => {
      enteringBar.append('rect')
        .attr('class', type)
        .attr('x', -0.5 * BAR_WIDTH)
        .attr('width', BAR_WIDTH)
        .attr('fill', TYPES_TO_COLORS[type])
      .append('title');
    });

    const bar = chart.selectAll('.bar')
      .data(imports);

    bar.attr('transform', d => d.startTimestamp && `translate(${x(new Date(d.startTimestamp))},0)`);

    ['inserted', 'processed', 'updated'].forEach(type => {
      bar.selectAll(`.${type}`)
        .attr('y', d => d[`${type}DocumentCount`] && y(d[`${type}DocumentCount`]))
        .attr('height', d => d[`${type}DocumentCount`] && (HEIGHT - y(d[`${type}DocumentCount`])))
      .selectAll('title')
        .text(d =>
          `${d[`${type}DocumentCount`]} records processed ${moment(d.startTimestamp).fromNow()}`
        );
    });

    bar.selectAll('.updated')
      .attr('y',
        d => d.updatedDocumentCount && y(d.updatedDocumentCount + (d.insertedDocumentCount || 0))
      );
  });
});
