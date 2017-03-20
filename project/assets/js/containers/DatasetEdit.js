import $ from 'jQuery';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import { patchObject } from 'actions/run';
import DatasetEditComponent from 'components/DatasetEdit';
import h from 'utils/helpers';


class DatasetEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = h.deepCopy(props.run);
    }

    handleFieldChange(data){
        let res = this.validateRawData(data);
        this.setState(res);
    }

    validateRawData(data){
        var rawData = data.raw_data,
            dType = data.data_type,
            rows = [],
            matrix = [],
            errs = [],
            dose = null,
            n = null,
            incidence = null,
            response = null,
            variance = null,
            uniqueDoseCheck = function(dose, errs){
                if (dose instanceof Array && _.uniq(dose).length !== dose.length){
                    errs.push('Doses must be unique.');
                }
            },
            doseIncreasingCheck = function(dose, errs){
                const allInceasing = _.chain(dose)
                    .map(function(d, i){
                        return (i<1) ? true : dose[i-1] <= d;
                    }).all().value();

                if (!allInceasing){
                    errs.push('Doses must be in increasing order.');
                }
            },
            checkBinaryResponse = function(inc, errs){
                if (
                    inc.length !==
                    _.filter(inc, function(d){return (d >=0 && d <= 1);}).length
                ){
                    errs.push('Response can only be 0 or 1.');
                }
            };

        try{

            rows = _.filter(rawData.split('\n'), function(d){
                return d.length > 0;
            });

            matrix = _.map(rows, function(r){
                return _.map(r.trim().split(/\s+/), function(d){
                    let num = parseFloat(d);
                    return _.isNaN(num) ? d : num;
                });
            });
            if (matrix.length <= 1){
                errs.push('Please enter data.');
            }
        } catch(err){
            errs.push('Invalid input format.');
        }

        if (matrix.length > 0){
            // remove header (optional)
            if (_.isNaN(parseFloat(matrix[0][0]))){
                matrix = matrix.slice(1, matrix.length);
            }
        }

        // confirm 2+ rows exist
        if (matrix.length < 2){
            errs.push('At least two rows are required.');
        } else {

            // confirm all-fields are numeric
            if (!_.chain(matrix).flatten().map($.isNumeric).all().value()){
                errs.push('All value must be numeric');
            }

            // check dose must be increasing
            if (dType === 'D'){
                // check 3 columns
                if (_.any(_.map(matrix, function(d){return d.length!==3;}))){
                    errs.push('Three columns of data are required.');
                } else {
                    dose = _.map(matrix, function(d){return d[0];});
                    n = _.map(matrix, function(d){return d[1];});
                    incidence = _.map(matrix, function(d){return d[2];});

                    uniqueDoseCheck(dose, errs);
                    doseIncreasingCheck(dose, errs);

                    if (_.chain(incidence).map(h.isntInt).any().value()){
                        errs.push('Incidence must be an integer value.');
                    }

                    if (_.chain(n).map(h.isntInt).any().value()){
                        errs.push('N must be an integer value.');
                    }

                    for(var i=0; i<n.length; i++){
                        if (incidence[i]>n[i]){
                            errs.push('Incidence must be ≤ N.');
                            break;
                        }
                    }
                }
            } else if (dType === 'E'){
                // check two columns
                if (_.any(_.map(matrix, function(d){return d.length!==2;}))){
                    errs.push('Two columns of data are required.');
                } else {
                    let ds = _.map(matrix, function(d){return d[0];}),
                        incs = _.map(matrix, function(d){return d[1];});

                    doseIncreasingCheck(ds, errs);
                    checkBinaryResponse(incs, errs);

                    dose = _.uniq(ds);
                    n = [];
                    incidence = [];
                    let pairs = _.zip(ds, incs);
                    _.each(dose, function(d){
                        let subset = _.filter(pairs, function(p){return p[0] == d;});
                        n.push(subset.length);
                        incidence.push(_.filter(subset, function(p){return p[1] == 1;}).length);
                    });
                }
            } else if (dType === 'C'){

                // check 4 columns
                if (_.any(_.map(matrix, function(d){return d.length!==4;}))){
                    errs.push('Four columns of data are required.');
                } else {
                    dose = _.map(matrix, function(d){return d[0];});
                    n = _.map(matrix, function(d){return d[1];});
                    response = _.map(matrix, function(d){return d[2];});
                    variance = _.map(matrix, function(d){return d[3];});

                    uniqueDoseCheck(dose, errs);
                    doseIncreasingCheck(dose, errs);

                    if (_.chain(n).map(h.isntInt).any().value()){
                        errs.push('N must be an integer value.');
                    }
                }

            } else if (dType === 'I'){
                // check two columns
                if (_.any(_.map(matrix, function(d){return d.length!==2;}))){
                    errs.push('Two columns of data are required.');
                } else {
                    dose = _.map(matrix, function(d){return d[0];});
                    response = _.map(matrix, function(d){return d[1];});

                    doseIncreasingCheck(dose, errs);
                }
            }
        }

        if (errs.length > 0){
            dose = null;
            incidence = null;
            n = null;
            response = null;
            variance = null;
        }

        return _.extend(data, {
            errors: errs,
            dose: dose,
            incidence: incidence,
            n: n,
            response: response,
            variance: variance,
        });
    }

    handleSave(e){
        e.preventDefault();
        let { dispatch } = this.props,
            id = this.props.run.id,
            patch = h.getPatch(this.props.run, this.state);

        patch = _.pick(patch, [
            'data_type',
            'variance_type',
            'raw_data',
            'dose',
            'incidence',
            'n',
            'response',
            'variance',
        ]);

        dispatch(patchObject(id, patch));
    }

    render(){
        return <DatasetEditComponent
            formValues={this.state}
            errors={this.props.errors}
            handleFieldChange={this.handleFieldChange.bind(this)}
            handleSave={this.handleSave.bind(this)} />;
    }
}

function mapState(state) {
    return {
        run: state.run.object,
        errors: state.run.editObjectErrors,
    };
}
export default connect(mapState)(DatasetEdit);
