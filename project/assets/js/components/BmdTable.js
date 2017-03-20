import _ from 'underscore';
import $ from 'jQuery';
import React from 'react';

import h from 'utils/helpers';


class BmdTable extends React.Component {

    createTable (stats, fieldName){
        var tbl = $('<table class="table table-condensed table-hover table-striped">');

        // add header
        $('<tr>').html(
            _.chain(stats)
                 .pluck('name')
                 .unshift('Statistic')
                 .map(function(d){return `<th>${d}</th>`;})
                 .value()
        ).appendTo(tbl);

        // add prior-model weight
        $('<tr>').html(
            _.chain(stats)
                 .pluck('prior_weight')
                 .unshift('Prior model weight')
                 .map(function(d){
                     if (isFinite(d)) d = h.printStatistic(d);
                     return `<td>${d}</td>`;
                 }).value()
        ).appendTo(tbl);

        // add model weight
        $('<tr>').html(
            _.chain(stats)
                 .pluck('weight')
                 .unshift('Posterior model weight')
                 .map(function(d){
                    if (isFinite(d)){
                        d = h.printStatistic(d);
                    }
                    return `<td>${d}</td>`;
                 }).value()
        ).appendTo(tbl);

        // add colgroup
        var nCols = stats.length+1,
            colHtml = _.times(nCols, function(){
                return `<col width='${1/nCols*100}'></col>`;
            }).join('');
        $('<colgroup>').html(colHtml).appendTo(tbl);

        // add Mean (SD) field
        _.chain(stats)
         .pluck(fieldName)
         .each(function(d){
             d.mean_sd = `${h.printStatistic(d.mean)}<br/>(${h.printStatistic(d.std)})`;
         });

        // add body
        var fields = {
                'p50':  'BMD (median)',
                'p5':   'BMDL (5%)',
                'p25':  '25%',
                'mean_sd': 'Mean<br/>(SD)',
                'p75':  '75%',
                'p95':  '95%',
            }, bolded = ['p50', 'p5'];

        _.each(fields, function(v, k){
            $('<tr>').html(
                _.chain(stats)
                    .pluck(fieldName)
                    .pluck(k)
                    .unshift(v)
                    .map(function(d){
                        if(_.contains(bolded, k)){
                            return `<td><b>${h.printStatistic(d)}</b></td>`;
                        } else {
                            return `<td>${h.printStatistic(d)}</td>`;
                        }
                    }).value()
            ).appendTo(tbl);
        });

        return tbl;
    }

    renderTables(){
        let bmd = this.props.bmd;
        if (_.isUndefined(bmd)) return;
        let stats = _.pluck(bmd.models, 'stats');
        stats.unshift(bmd.stats);

        if(bmd.stats.stats){
            $(this.refs.bmd).html(this.createTable(stats, 'stats'));
        }
        if(bmd.stats.added){
            $(this.refs.added).html(this.createTable(stats, 'added'));
        }
        if(bmd.stats.extra){
            $(this.refs.extra).html(this.createTable(stats, 'extra'));
        }
    }

    componentDidMount(){
        this.renderTables();
    }

    componentDidUpdate(){
        this.renderTables();
    }

    render() {
        if (this.props.bmd.stats.stats){
            return (
                 <div id={this.props.bmd.id}>
                    <h4>Risk</h4>
                    <div ref='bmd'></div>
                </div>
            );
        } else {
            return (
                <div id={this.props.bmd.id}>
                    <h4>Added risk</h4>
                    <div ref='added'></div>
                    <h4>Extra risk</h4>
                    <div ref='extra'></div>
                </div>
            );
        }
    }

}

export default BmdTable;
