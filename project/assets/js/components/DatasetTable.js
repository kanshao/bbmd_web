import React from 'react';

import h from 'utils/helpers';


class DatasetTable extends React.Component {

    renderHeader(run) {
        switch(run.data_type){
        case 'D':
        case 'E':
            return (
                <thead>
                    <tr>
                        <th width='34%'>Dose</th>
                        <th width='33%'>N</th>
                        <th width='33%'>Incidence</th>
                    </tr>
                </thead>
            );
        case 'C':
            return (
                <thead>
                    <tr>
                        <th width='25%'>Dose</th>
                        <th width='15%'>N</th>
                        <th width='30%'>Response</th>
                        <th width='30%'>{run.variance_type_display}</th>
                    </tr>
                </thead>
            );
        case 'I':
            return (
                <thead>
                    <tr>
                        <th width='50%'>Dose</th>
                        <th width='50%'>Response</th>
                    </tr>
                </thead>
            );
        }
    }

    renderTbody(run){
        let doses = run.dose || [];
        switch(run.data_type){
        case 'D':
        case 'E':
            return (
                <tbody>
                    {doses.map((d, i)=>{
                        return (
                            <tr key={i}>
                                <td>{run.dose[i]}</td>
                                <td>{run.n[i]}</td>
                                <td>{run.incidence[i]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            );
        case 'C':
            return (
                <tbody>
                    {doses.map((d, i)=>{
                        return (
                            <tr key={i}>
                                <td>{run.dose[i]}</td>
                                <td>{run.n[i]}</td>
                                <td>{run.response[i]}</td>
                                <td>{run.variance[i]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            );
        case 'I':
            return (
                <tbody>
                    {doses.map((d, i)=>{
                        return (
                            <tr key={i}>
                                <td>{run.dose[i]}</td>
                                <td>{run.response[i]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            );
        }
    }

    renderFootnote(run){
        if (!run.trend_p_value) return null;
        return (
           <tfoot>
                <tr>
                    <td colSpan='5'>
                        <span>Trend test <i>p</i>-value: {h.printStatistic(run.trend_p_value)} (z-score: {h.printStatistic(run.trend_z_test)})</span>
                    </td>
                </tr>
            </tfoot>
        );
    }

    render(){
        var run = this.props.run;
        return (
            <table className='table table-condensed table-striped'>
                {this.renderHeader(run)}
                {this.renderFootnote(run)}
                {this.renderTbody(run)}
            </table>
        );
    }
}

export default DatasetTable;
