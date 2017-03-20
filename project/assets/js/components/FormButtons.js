import React from 'react';


class FormButtons extends React.Component {

    render(){
        if (this.props.isNew){
            return (
                <div className="form-group">
                    <div className="col-sm-12">
                        <button
                            onClick={this.props.handleSubmit}
                            className="btn btn-primary"
                            type="button">
                            <i className="fa fa-plus-circle"></i> Create</button>
                        <span>&nbsp;</span>
                        <button
                            onClick={this.props.handleCancel}
                            className="btn btn-default"
                            type="button">
                            Cancel</button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="form-group">
                    <div className="col-sm-12">
                        <button
                            onClick={this.props.handleSubmit}
                            className="btn btn-primary"
                            type="button">
                            <i className="fa fa-pencil-square-o"></i> Update</button>
                        <span>&nbsp;</span>
                        <button
                            onClick={this.props.handleDelete}
                            className="btn btn-danger"
                            type="button">
                            <i className="fa fa-trash"></i> Delete</button>
                        <span>&nbsp;</span>
                        <button
                            onClick={this.props.handleCancel}
                            className="btn btn-default"
                            type="button">
                            Cancel</button>
                    </div>
                </div>
            );
        }
    }
}

FormButtons.propTypes = {
    isNew: React.PropTypes.bool.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
    handleDelete: React.PropTypes.func.isRequired,
    handleCancel: React.PropTypes.func.isRequired,
};

export default FormButtons;
