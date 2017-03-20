import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import {
    postObject,
    patchObject,
    deleteObject,
    changeSelectedBmd,
} from 'actions/bmds';
import BMDEstimateEditComponent from 'components/BmdEstimateEdit';
import h from 'utils/helpers';


class BMDEstimateEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getFormState(props.selectedModel);
    }

    componentWillReceiveProps(props){
        let newState = this.getFormState(props.selectedModel);
        this.state = newState;
        this.setState(newState);
    }

    getDefaultObject(){
        switch (this.props.data_type){
        case 'D':
        case 'E':
            return {
                run: this.props.run.id,
                name: '10%',
                subtype: 'D',
                bmr: 0.1,
            };
        case 'C':
        case 'I':
            return {
                run: this.props.run.id,
                name: 'Central tendency: relative change',
                subtype: 'C',
                bmr: 0.1,
                adversity_ct_type: 'R',
                adversity_hybrid_type: 'P',
                adversity_value: null,
            };
        }
    }

    getFormState(object){
        let obj = (object) ?
            h.deepCopy(object):
            this.getDefaultObject();
        return obj;
    }

    handleFieldChange(e){
        let obj = {},
            val = h.getValue(e.target);
        obj[e.target.name] = val;
        this.checkFieldNameChange(e.target.name, val);
        this.setState(obj);
    }

    checkFieldNameChange(fldName, val, e){
        let name,
            getName = function(st, act, aht){
                let name;
                if (st == 'C'){
                    name = 'Central tendency: ';
                    if (act=='R'){
                        return name + 'relative change';
                    } else if(act=='A') {
                        return name + 'absolute change';
                    } else {
                        return name + 'cutoff';
                    }
                } else {
                    name = 'Hybrid (tails): ';
                    if (aht=='P'){
                        return name + 'percentile';
                    } else {
                        return name + 'cutoff';
                    }
                }
            };

        switch(this.props.data_type){
        case 'D':
        case 'E':
            if (fldName == 'bmr'){
                name = (parseFloat(val) * 100) + '%';
                return this.setState({'name': name});
            }
        case 'C':
        case 'I':
            if(_.contains([
                'subtype',
                'adversity_ct_type',
                'adversity_hybrid_type',
            ], fldName)){

                let stype = this.state.subtype,
                    actype = this.state.adversity_ct_type,
                    ahtype = this.state.adversity_hybrid_type;

                if (fldName == 'subtype') stype = val;
                if (fldName == 'adversity_ct_type') actype = val;
                if (fldName == 'adversity_hybrid_type') ahtype = val;
                return this.setState({'name': getName(stype, actype, ahtype)});
            }
            break;
        }
    }

    getPriorWeightsFromObject(){
        let weights = {},
            models = (this.props.selectedModel && this.props.selectedModel.models)?
                this.props.selectedModel.models:
                [];
        models.forEach((d) => weights[d.model] = d.prior_weight);
        return weights;
    }

    getPriorWeightsFromForm(){
        let inputs = document.querySelectorAll('.priorTbl input'),
            priors = [];
        for(let i=0; i<inputs.length; i++){
            let node = inputs[i];
            priors.push({
                id: parseInt(node.dataset.model_id),
                prior_weight: parseFloat(node.value),
            });
        }
        return _.sortBy(priors, (v) => v.id);
    }

    handleFormCancel(){
        const { dispatch } = this.props;
        dispatch(changeSelectedBmd(null));
    }

    handleSubmit(e){
        const { dispatch } = this.props,
            prior_weight = this.getPriorWeightsFromForm(),
            id = this.state.id,
            cb = this.handleFormCancel.bind(this),
            values = Object.assign({}, this.state, {prior_weight});
        if (values.bmr)
            values.bmr = parseFloat(values.bmr);
        if (values.adversity_value)
            values.adversity_value = parseFloat(values.adversity_value);
        if (id){
            const patch = h.getPatch(this.props.selectedModel, values);
            dispatch(patchObject(id, patch, cb));
        } else {
            dispatch(postObject(values, cb));
        }
    }

    handleDelete(e){
        const { dispatch } = this.props;
        dispatch(deleteObject(this.props.selectedModel.id, this.handleFormCancel.bind(this)));
    }

    render(){
        let isNew = (!this.state.id) ? true : false;
        return <BMDEstimateEditComponent
            priorWeights={this.getPriorWeightsFromObject()}
            models={this.props.models}
            isNew={isNew}
            formValues={this.state}
            errors={this.props.bmds.editObjectErrors}
            handleFieldChange={this.handleFieldChange.bind(this)}
            handleSubmit={this.handleSubmit.bind(this)}
            handleDelete={this.handleDelete.bind(this)}
            handleCancel={this.handleFormCancel.bind(this)}
            onMount={this.props.onMount.bind(this)}
            object={this.props.selectedModel}
            adversityRanges={this.props.run.bmr_ranges}
            data_type={this.props.data_type}
            serverError={this.props.serverError} />;
    }

}

BMDEstimateEdit.propTypes = {
    onMount: React.PropTypes.func.isRequired,
};

function mapState(state) {return {
    bmds: state.bmds,
    models: state.models.objects,
    serverError: state.bmds.serverError,
    run: state.run.object,
    data_type: state.run.object.data_type,
};}
export default connect(mapState)(BMDEstimateEdit);
