import React from 'react';


class ModelSettings extends React.Component {

    render(){
        var run = this.props.run;
        return (
            <div>
                <h3>Model run settings</h3>
                <p><strong>Pystan version</strong> {this.props.pystanVersion}</p>
                <p><strong>Iterations:</strong> {run.mcmc_iterations}</p>
                <p><strong>Number of chains:</strong> {run.mcmc_num_chains}</p>
                <p><strong>Warmup percent:</strong> {run.mcmc_warmup_percent}%</p>
                <p><strong>Seed:</strong> {run.seed}</p>
            </div>
        );
    }

}

export default ModelSettings;
