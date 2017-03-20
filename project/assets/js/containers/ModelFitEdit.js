import $ from 'jQuery';
import React from 'react';
import { connect } from 'react-redux';

import {
    postObject,
    patchObject,
    deleteObject,
} from 'actions/models';
import ModelFitEditComponent from 'components/ModelFitEdit';
import h from 'utils/helpers';


class ModelFitEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getFormState(props.selectedModel);
    }

    componentWillReceiveProps(props){
        let newState = this.getFormState(props.selectedModel);
        this.state = newState;
        this.setState(newState);
    }

    getFormState(object){
        if (object)
            return h.deepCopy(object);

        switch (this.props.data_type){
        case 'D':
        case 'E':
            return {
                model_type: 'DLg',
                name: 'Logistic',
                run: this.props.run_id,
                power_lower_bound: 'one',
            };
        case 'C':
        case 'I':
            return {
                model_type: 'CE2',
                name: 'Exponential 2',
                run: this.props.run_id,
                power_lower_bound: 'one',
            };
        }
    }

    handleFieldChange(e){
        let obj = {};
        obj[e.target.name] = h.getValue(e.target);
        this.setState(obj);
    }

    handleModelTypeChange(e){
        this.setState({name: $(e.target).find('option:selected').text()});
        this.handleFieldChange(e);
    }

    handleSubmit(e){
        const { dispatch } = this.props;
        let id = this.state.id,
            cb = this.props.handleFormCancel;
        if (id){
            let patch = h.getPatch(this.props.selectedModel, this.state);
            dispatch(patchObject(id, patch, cb));
        } else {
            dispatch(postObject(this.state, cb));
        }
    }

    handleDelete(e){
        const { dispatch } = this.props;
        dispatch(deleteObject(this.props.selectedModel.id, this.props.handleFormCancel));
    }

    handleCancel(e){
        this.props.handleFormCancel();
    }

    render(){
        let isNew = (!this.state.id) ? true : false;
        return <ModelFitEditComponent
            model_type={this.props.data_type}
            isNew={isNew}
            formValues={this.state}
            errors={this.props.models.editObjectErrors}
            handleFieldChange={this.handleFieldChange.bind(this)}
            handleModelTypeChange={this.handleModelTypeChange.bind(this)}
            handleSubmit={this.handleSubmit.bind(this)}
            handleDelete={this.handleDelete.bind(this)}
            handleCancel={this.handleCancel.bind(this)} />;
    }

}

function mapState(state) {return {
    models: state.models,
    run_id: state.run.object.id,
    data_type: state.run.object.data_type,
};}
export default connect(mapState)(ModelFitEdit);
