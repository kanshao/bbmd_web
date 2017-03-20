import React from 'react';


class ServerError extends React.Component {

    render(){
        return (
            <div className="alert alert-danger" role="alert">
                <span className="fa fa-exclamation-triangle"></span>
                <strong>Error:&nbsp;</strong>
                <span>
                    Something went wrong on the server; administrators have been notified.
                    We're sorry for the inconvience; we'll do our best to fix it soon!
                </span>
            </div>
        );
    }

}

export default ServerError;
