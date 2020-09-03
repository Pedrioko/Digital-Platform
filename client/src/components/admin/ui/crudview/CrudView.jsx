import React from 'react';
import Table from '../table/Table';
import axios from 'axios';
import Pagination from "react-js-pagination";
import Modal from '../modal/Modal';
import './CrudView.css';
import { CommonLoading } from 'react-loadingg';

class CrudView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activePage: 1,
            initialItems: [],
            items: [],
            itemCount: 0,
            pageSize: 0,
            headers: this.props.headers,
            extraAcciones: [],
            modal: false,
            onOkClick: null,
            loading: true
        }
        this.deleteClick = this.deleteClick.bind(this);
    }
    componentWillMount() {
        var user = localStorage.getItem("userInfo");
        if (!user) {
            this.props.history.push('/admin/login');

        }

        this.loadPage(1);
    }

    editClick = (item) => {
        this.props.history.push({
            pathname: this.props.baseRoute + '/edit/' + item._id,
            state: {
                item: item
            }
        })
    }


    deleteClick = async (item) => {
        await this.setState({
            modal: true,
            onOkClick: () =>
                axios
                    .delete(this.props.baseUrl + '/' + item._id)
                    .then(res => {
                        this.loadPage(1);
                        this.setState({
                            modal: false
                        })
                    }),
            onClose: () =>
                this.setState({
                    modal: false
                })

        })
    }

    onPageChanged = data => {
        this.loadPage(data);
        this.setState({
            activePage: data
        })
    }

    async loadPage(page) {
        await this.setState({
            loading: true
        })
        axios.get(this.props.baseUrl + '/all/' + page)
            .then(response => {
                this.setState({
                    items: response.data.itemsList,
                    paginator: response.data.paginator,
                    itemCount: response.data.paginator.itemCount,
                    pageSize: response.data.paginator.perPage,
                    loading: false
                });
            });
    }
    newClick = (item) => {
        this.props.history.push({
            pathname: this.props.baseRoute + '/new/0'
        })
    }

    render() {

        return (
            <div className="container-fluid ">
                {
                    (this.state.modal) ?
                        <Modal show="true" okLabel="Delete" content="Are you sure?" title="Delete" onOkClick={this.state.onOkClick}
                            onClose={this.state.onClose}
                            style={
                                {
                                    buttonOk: "btn btn-danger",
                                    buttonCancel: "btn btn-primary"
                                }
                            }
                        />
                        : ""

                }
                <div className="row m-2 shadow-sm">
                    <div className="col-12 py-1 bg-secondary">
                        <button title="New" onClick={this.newClick} className="btn btn-sm btn-primary"><i className="fas fa-plus-square"></i></button>
                    </div>
                    <div className="table-responsive">
                        {(this.state.loading) ?
                            <div className="m-5 pb-5" style={{
                                display: "block",
                                position: "relative",
                                width: "90%",
                                minHeight: "800px"
                            }}>
                                <CommonLoading size="small" />
                            </div>
                            : <Table
                                headers={this.state.headers}
                                data={this.state.items}
                                editClick={this.editClick}
                                deleteClick={this.deleteClick}
                                extraAcciones={this.props.extraAcciones}

                            />
                        }
                    </div>
                    <div className="col-12" >
                        <Pagination
                            activePage={this.state.activePage}
                            totalItemsCount={this.state.itemCount}
                            itemsCountPerPage={this.state.pageSize}
                            pageRangeDisplayed={9}
                            onChange={this.onPageChanged} />
                    </div>
                </div>
            </div >
        );
    }

}

export default CrudView;