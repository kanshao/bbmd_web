import $ from 'jQuery';
import React from 'react';


class PublicRunToggle extends React.Component {

    componentDidMount() {
        let el = $(this.refs.public);
        el.bootstrapSwitch({
            onText: 'Yes',
            offText: 'No',
            onColor: 'success',
            offColor: 'primary',
            labelText: 'Public?',
            size: 'mini',
            onSwitchChange: this.props.handleChange,
        });
    }

    render(){
        return <input
            checked={this.props.formValue}
            onChange={this.props.handleChange}
            ref='public'
            type="checkbox" />;
    }

}

export default PublicRunToggle;



