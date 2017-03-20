import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import {
    fetchBmdsIfNeeded,
    fetchBmdPlotIfNeeded,
    changeSelectedBmd,
} from 'actions/bmds';
import BmdEstimateEdit from 'containers/BmdEstimateEdit';


class BmdEstimatesEdit extends React.Component {

    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fetchBmdsIfNeeded());
    }

    onBmdEstimateMount(bmd){
        const { dispatch } = this.props;
        dispatch(fetchBmdPlotIfNeeded(bmd));
    }

    handlePillsClick(e){
        const { dispatch } = this.props;
        e.preventDefault();
        dispatch(changeSelectedBmd(parseInt(e.target.getAttribute('data-id'))));
    }

    renderPills(bmd){
        let className = (
             this.props.bmds.selectedObjectId &&
             this.props.bmds.selectedObjectId === bmd.id) ? 'active' : '',
            styles = {cursor: 'pointer'};
        return (
            <li key={bmd.id} className={className}>
                <a style={styles}
                   data-id={bmd.id}
                   onClick={this.handlePillsClick.bind(this)}>{bmd.name}</a>
            </li>
        );
    }

    renderCreateButton(){
        let className = (this.props.bmds.selectedObjectId === null) ? 'active' : '',
            styles = {cursor: 'pointer'};
        return (
            <li className={className}>
                <a style={styles}
                   onClick={this.handleCreateClick.bind(this)}>
                    <i className='fa fa-plus-circle'></i> Add new BMD
                </a>
            </li>
        );
    }

    handleCreateClick() {
        const { dispatch } = this.props;
        dispatch(changeSelectedBmd(null));
    }

    render(){
        let objects = this.props.bmds.objects || [],
            objects_len = objects.length,  // trigger rerender if changed
            selectedBmd = _.findWhere(
                this.props.bmds.objects,
                {id: this.props.bmds.selectedObjectId});
        return (
            <div className='row-fluid'>
                <div className='col-sm-2'>
                    <ul className='nav nav-pills nav-stacked' data-items={objects_len}>
                        {objects.map(this.renderPills.bind(this))}
                        {this.renderCreateButton()}
                    </ul>
                </div>
                <div className='col-sm-10'>
                    <div className='tab-content'>
                        <BmdEstimateEdit
                            selectedModel={selectedBmd}
                            onMount={this.onBmdEstimateMount.bind(this)} />
                    </div>
                </div>
            </div>
        );
    }

}

function mapState(state) {
    return {
        config: state.config,
        bmds: state.bmds,
    };
}

export default connect(mapState)(BmdEstimatesEdit);
