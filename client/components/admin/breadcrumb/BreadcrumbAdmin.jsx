import React from 'react';
import { withRouter } from 'react-router-dom'
import './BreadcrumbAdmin.css'
class BreadcrumbAdmin extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            routes: []
        }
    }

    componentDidMount() {
        this.loadBreadcrumb();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            this.loadBreadcrumb();
        }
    }


    async loadBreadcrumb() {
        await this.setState({
            routes: this.props.location.pathname.trim().split("/").filter(e => e !== "")
        });
        //p:contains('" + this.capitalizeFirstLetter(this.state.routes.slice(-1).pop()) + "')
        let array = $(".nav-link")

        for (let i = 0; i < array.length; i++) {
            if (array[i].html() == this.capitalizeFirstLetter(this.state.routes.slice(-1).pop)) {
                array[i].parent().addClass("active")
            }

        }


    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    render() {
        const { routes } = this.state;
        return (
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6">
                        <h1 className="m-0 text-dark">Dashboard</h1>
                    </div>
                    <div className="col-sm-6">
                        <ol className="breadcrumb w-100 di-flex flow-row justify-content-end" >

                            {
                                routes.map((route, index) => {
                                    return (
                                        <li className=" text-capitalize breadcrumb-item" key={index}><a>{isNaN(route) ? route : "Page " + route}</a></li>
                                    );
                                })
                            }
                        </ol>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(BreadcrumbAdmin);