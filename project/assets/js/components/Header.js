import React from 'react';


class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editInReadingMode: true,
        };
    }

    componentDidUpdate(){
        if (this.props.isEditMode && !this.state.editInReadingMode){
            this.refs.name.focus();
        }
    }

    renderReadMode() {
        return (
            <h1>
                <span>{this.props.object.name}</span>
                {this.renderReadModeActions()}
            </h1>
        );
    }

    renderReadModeActions(){
        let object = this.props.object,
            actions = [];

        if (this.props.hasChangeActions){
            actions.push.apply(actions, [
                <li className="dropdown-header" key={10}>Editing</li>,
                <li key={15}><a href={object.url_update}>
                    <i className="fa fa-pencil-square-o fa-fw" aria-hidden="true"></i>&nbsp;Update</a></li>,
                <li key={20}><a href={object.url_delete}>
                    <i className="fa fa-trash fa-fw" aria-hidden="true"></i>&nbsp;Delete</a></li>,
                <li className="divider" role="separator" key={5}></li>,
            ]);
        }

        actions.push.apply(actions, [
            <li className="dropdown-header" key={0}>Reports</li>,
            <li key={25}>
                <a href={object.url_docx}>
                    <i className="fa fa-file-word-o fa-fw" aria-hidden="true"></i>&nbsp;Download report</a>
            </li>,
            <li key={30}>
                <a href={object.url_parameters}>
                    <i className="fa fa-file-excel-o fa-fw" aria-hidden="true"></i>&nbsp;Download parameters</a>
            </li>,
            <li key={35}>
                <a href={object.url_bmds}>
                    <i className="fa fa-file-excel-o fa-fw" aria-hidden="true"></i>&nbsp;Download BMDs</a>
            </li>,
            <li key={40}>
                <a href={object.url_summary_txt}>
                    <i className="fa fa-file-text-o fa-fw" aria-hidden="true"></i>&nbsp;Download summary (text)</a>
            </li>,
            <li key={45}>
                <a href={object.url_summary_json}>
                    <i className="fa fa-file-code-o fa-fw" aria-hidden="true"></i>&nbsp;Download summary (JSON)</a>
            </li>,
        ]);

        return (
            <div className='btn-group pull-right'>
                <button type='button'
                        className='btn btn-primary dropdown-toggle'
                        data-toggle='dropdown'
                        aria-haspopup='true'
                        aria-expanded='false'>Actions <span className='caret'></span>
                </button>
                <ul className='dropdown-menu'>
                    {actions}
                </ul>
            </div>
        );
    }

    handleNameSave() {
        this.props.handleNameSave();
        this.toggleEditingMode();
    }

    toggleEditingMode() {
        this.setState({editInReadingMode: !this.state.editInReadingMode});
    }

    renderCancelActions() {
        return (
            <a className="btn btn-success pull-right"
               title='Finish updating'
               href={this.props.object.url}>
                    <i className="fa fa-fw fa-chevron-circle-left"></i>&nbsp;
                    Finish updating</a>
        );
    }

    renderEditInReadingMode() {
        return (
            <h1>
                <span
                    style={{
                        display: 'inline-block',
                        minWidth: '500px',
                        border: '2px solid white',
                    }}
                    >{this.props.object.name}</span>
                <span>&nbsp;</span>
                <button
                    onClick={this.toggleEditingMode.bind(this)}
                    type="button"
                    className="btn btn-sm btn-default"
                    title="Edit run name">
                        <i className="fa fa-pencil-square-o"></i> Edit name
                </button>
                {this.renderCancelActions()}
            </h1>
        );
    }

    renderEditInEditingMode() {
        return (
            <h1>
                <input
                    style={{
                        minWidth: '500px',
                        padding: '0',
                    }}
                    name="name"
                    type="text"
                    ref="name"
                    onChange={this.props.handleNameChange}
                    value={this.props.formName}></input>
                <span>&nbsp;</span>
                <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={this.handleNameSave.bind(this)}
                    title="Save name">
                        <i className="fa fa-check-circle-o"></i> Save
                </button>
                <span>&nbsp;</span>
                <button
                    type="button"
                    className="btn btn-sm btn-warning"
                    onClick={this.toggleEditingMode.bind(this)}
                    title="Cancel change">
                        <i className="fa fa-times-circle-o"></i> Cancel
                </button>
                {this.renderCancelActions()}
            </h1>
        );
    }

    render(){
        if (this.props.isEditMode){
            return (this.state.editInReadingMode) ?
                this.renderEditInReadingMode():
                this.renderEditInEditingMode();
        } else {
            return this.renderReadMode();
        }
    }
}


Header.propTypes = {
    hasChangeActions: React.PropTypes.bool.isRequired,
    isEditMode: React.PropTypes.bool.isRequired,
    handleNameChange: React.PropTypes.func.isRequired,
    handleNameSave: React.PropTypes.func.isRequired,
    object: React.PropTypes.object.isRequired,
};


export default Header;
