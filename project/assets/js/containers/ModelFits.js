import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import {
    fetchModelSettingsIfNeeded,
    fetchModelSettingsPlotIfNeeded,
    fetchModelSettingsParameterPlotIfNeeded,
} from 'actions/models';
import ModelFitEdit from 'containers/ModelFitEdit';
import ModelFit from 'components/ModelFit';


class ModelFits extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedModel: null,
            showNewForm: false,
        };
    }

    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fetchModelSettingsIfNeeded());
    }

    onModelFitWillMount(id){
        const { dispatch, models } = this.props;
        let model = _.findWhere(models.objects, {id});
        dispatch(fetchModelSettingsPlotIfNeeded(model));
    }

    onClickShowParameterPlot(id){
        const { dispatch, models } = this.props;
        let model = _.findWhere(models.objects, {id});
        dispatch(fetchModelSettingsParameterPlotIfNeeded(model));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.models.objects && nextProps.models.objects.length>0){
            let model = null;
            if(!this.state.selectedModel){
                model = nextProps.models.objects[0];
            } else {
                model = _.findWhere(nextProps.models.objects, {id: this.state.selectedModel.id});
            }
            this.setState({
                selectedModel: model,
                showNewForm: false,
            });
        }
    }

    handleModelsClick(e){
        e.preventDefault();
        let model = _.findWhere(
            this.props.models.objects,
            {id: parseInt(e.target.getAttribute('data-id'))}
        );
        this.setState({
            selectedModel: model,
            showNewForm: false,
        });
    }

    renderPills(model){
        let className = (this.state.selectedModel === model) ? 'active' : '',
            styles = {cursor: 'pointer'};
        return (
            <li key={model.id} className={className}>
                <a style={styles}
                   data-id={model.id}
                   onClick={this.handleModelsClick.bind(this)}>{model.name}</a>
            </li>
        );
    }

    renderCreateButton(){
        if (!this.props.isEditMode) return null;
        let styles = {cursor: 'pointer'};
        return (
            <li>
                <a style={styles}
                   onClick={this.handleCreateClick.bind(this)}>
                    <i className='fa fa-plus-circle'></i> Add new model
                </a>
            </li>
        );
    }

    handleCreateClick() {
        this.setState({
            showNewForm: true,
            selectedModel: null,
        });
    }

    handleFormCancel(){
        this.setState({
            selectedModel: null,
            showNewForm: false,
        });
    }

    render(){
        let models = this.props.models.objects,
            selectedModel = this.state.selectedModel,
            content = (this.props.isEditMode)?
                <p className='help-block'>Select an existing model or create a new one.</p>:
                <p className='help-block'>Select an existing model.</p>;

        if(selectedModel && !this.props.isEditMode){
            content = <ModelFit
                    model={selectedModel}
                    onModelFitWillMount={this.onModelFitWillMount.bind(this)}
                    onClickShowParameterPlot={this.onClickShowParameterPlot.bind(this)} />;
        }

        if(this.state.showNewForm || (selectedModel && this.props.isEditMode)){
            content = <ModelFitEdit
                    selectedModel={selectedModel}
                    handleFormCancel={this.handleFormCancel.bind(this)} />;
        }

        return (
            <div className='row-fluid'>
                <div className='col-sm-2'>
                    <ul className='nav nav-pills nav-stacked'>
                        {models.map(this.renderPills.bind(this))}
                        {this.renderCreateButton()}
                    </ul>
                </div>
                <div className='col-sm-10'>
                    <div className='tab-content'>
                        {content}
                    </div>
                </div>
            </div>
        );
    }

}

ModelFits.propTypes = {
    isEditMode: React.PropTypes.bool.isRequired,
};

function mapState(state) {
    return {
        models: state.models,
    };
}

export default connect(mapState)(ModelFits);
