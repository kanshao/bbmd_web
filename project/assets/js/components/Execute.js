import _ from 'underscore';
import React from 'react';

import ServerError from './ServerError';


class Execute extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hasRefetchedModels: false,
        };
    }

    componentDidUpdate(){
        if (this.hasRunCompleted()){
            if (!this.state.hasRefetchedModels){
                this.props.handleFetchModelSettings();
                this.setState({hasRefetchedModels: true});
            }
        }  else {
            if (this.hasRunStarted() && this.state.hasRefetchedModels){
                this.setState({hasRefetchedModels: false});
            }
        }
    }

    renderStatus(obj, i){
        let iconClass = (obj.passed)?
            'fa fa-check-circle':
            'fa fa-exclamation-circle';

        let listClass = (obj.passed)?
            'list-group-item list-group-item-success':
            'list-group-item list-group-item-danger';

        return <li key={i} className={listClass}><i className={iconClass}></i>&nbsp;{obj.text}</li>;
    }

    hasRunCompleted(){
        return this.props.executionStartTime && this.props.executionEndTime;
    }

    hasRunStarted(){
        return this.props.executionStartTime;
    }

    renderServerError(){
        return (this.props.serverError) ? <ServerError /> : null;
    }

    renderSubmission(){
        if (this.hasRunCompleted()){
            return (
                <div>
                    <button
                        onClick={this.props.handleExecute}
                        className="btn btn-primary"
                        type="button">Re-execute</button>
                    <p>Run complete!</p>
                </div>
            );
        } else if (this.hasRunStarted()){
            return (
                <div>
                    <button
                        disabled={true}
                        onClick={this.props.handleExecute}
                        className="btn btn-primary"
                        type="button">Executing
                            <i style={{marginLeft: '1em'}} className='fa fa-spinner fa-pulse'></i>
                        </button>
                    <p>Running, started <span id='executionTimeDiv'>0 seconds ago</span>-  please wait...</p>
                </div>
            );
        } else if (this.isReady()) {
            return (
                <div>
                    <button
                        onClick={this.props.handleExecute}
                        className="btn btn-primary"
                        type="button">Execute</button>
                    <p>All checks passed. Ready to execute!</p>
                </div>
            );
        } else {
            <p className='text-danger'>Please correct checks above before attempting to run.</p>;
        }
    }

    isReady(){
        return _.chain(this.props.checks)
                       .pluck('passed')
                       .all()
                       .value();
    }

    render(requestPlot){
        return (
          <div>
            <label>Final checks before exeuction:</label>
            <ul className='list-group'>
                {this.props.checks.map(this.renderStatus)}
            </ul>
            {this.renderServerError()}
            {this.renderSubmission()}
          </div>
        );
    }

}

Execute.propTypes = {
    executionStartTime: React.PropTypes.instanceOf(Date),
    executionEndTime: React.PropTypes.instanceOf(Date),
    checks: React.PropTypes.array.isRequired,
    handleExecute: React.PropTypes.func.isRequired,
    handleFetchModelSettings: React.PropTypes.func.isRequired,
    serverError: React.PropTypes.bool.isRequired,
};

export default Execute;
