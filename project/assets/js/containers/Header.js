import React from 'react';
import { connect } from 'react-redux';

import { patchObject } from 'actions/run';
import HeaderComponent from 'components/Header';


class Header extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            name: props.run.object.name,
        };
    }

    handleNameChange(e){
        this.setState({name: e.target.value});
    }

    handleNameSave(){
        const { dispatch } = this.props,
            id = this.props.run.object.id,
            patch = {name: this.state.name};
        dispatch(patchObject(id, patch));
    }

    render() {
        let hasChangeActions = (this.props.run.object.owner === this.props.config.user_id);
        return <HeaderComponent
            formName={this.state.name}
            hasChangeActions={hasChangeActions}
            isEditMode={this.props.config.isEditMode}
            handleNameChange={this.handleNameChange.bind(this)}
            handleNameSave={this.handleNameSave.bind(this)}
            object={this.props.run.object} />;
    }

}

function mapState(state) {
    return {
        config: state.config,
        run: state.run,
    };
}
export default connect(mapState)(Header);
