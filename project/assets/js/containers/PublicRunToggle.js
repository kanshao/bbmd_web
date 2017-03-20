import React from 'react';
import { connect } from 'react-redux';

import { patchObject } from 'actions/run';
import PublicRunToggleComponent from 'components/PublicRunToggle';


class PublicRunToggle extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            public: props.public,
        };
    }

    handleChange(e){
        this.setState({public: e.target.checked});
        const { dispatch } = this.props,
            id = this.props.id,
            patch = {public: this.state.public};
        dispatch(patchObject(id, patch));
    }

    render() {
        return <PublicRunToggleComponent
            formValue={this.state.public}
            handleChange={this.handleChange.bind(this)} />;
    }

}

function mapState(state) {
    return {
        id: state.run.object.id,
        public: state.run.object.public,
    };
}
export default connect(mapState)(PublicRunToggle);
