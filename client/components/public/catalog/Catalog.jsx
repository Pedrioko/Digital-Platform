import React from 'react';
import Movie from '../movie/Movie'
import axios from 'axios';
import { generatePath } from "react-router";
import CheckBox from '../ui/Checkbox';
import './Catalog.css';
import Pagination from "react-js-pagination";

import queryString from 'query-string'

class Catalog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            initialItems: [],
            items: [],
            itemCount: 0,
            pageSize: 0,
            categorias: [],
            activePage: 0,
            search: '',
            timerange: [0, 5000]
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.load = this.load.bind(this);

    }
    filtrarLista = (event) => {
        var updatedList = this.state.initialItems;
        updatedList = updatedList.filter(function (item) {
            return item.name.toLowerCase().search(event.target.value.toLowerCase()) !== -1;
        });
        this.setState({ items: updatedList });
    }

    handleChange(event) {
        this.setState({ search: event.target.value });

    }

    vermas = (item) => {
        this.props.history.push({
            pathname: '/catalog/movie',
            state: {
                item: item
            }
        })
    }

    load = async () => {

        const values = queryString.parse(this.props.location.search)

        let page = this.props.match.params.page;

        page = page ? parseInt(page) : 1;

        var statesVal = { activePage: page }
        if (values && values.search)
            statesVal.search = values.search

        debugger
        await this.setState(statesVal);
        this.loadCate();
        this.loadPage(page);
    }
    async componentDidMount() {
        this.load();
    }

    async componentDidUpdate() {
        window.onpopstate = () => {
            this.load();
        }
    }

    onPageChanged = pageNumber => {
        pageNumber = parseInt(pageNumber)
        this.setState({ activePage: pageNumber });
        this.loadPage(pageNumber);
        this.props.history.push({
            pathname: generatePath(this.props.match.path, { page: pageNumber }),
            search: this.props.location.search ? this.props.location.search : "",

        });
    }

    loadCate() {
        axios.get('/api/categorias/all/-1')
            .then(response => {
                console.log(response);
                this.setState({
                    categorias: response.data.map(e => {
                        e.isChecked = false;
                        return e;
                    })
                });
            });
    }

    loadPage(page) {

        let find = {
            name: { "$regex": ".*" + this.state.search + ".*", $options: 'i' },
            duration: this.state.timerange

        }
        let cats = this.state.categorias.filter(e => e.isChecked);
        if (cats.length > 0)
            find.categorias = cats.map(e => e._id);

        axios.post('/api/movies/all/' + page, find)
            .then(response => {
                this.setState({
                    items: response.data.itemsList,
                    paginator: response.data.paginator,
                    itemCount: response.data.paginator.itemCount,
                    pageSize: response.data.paginator.perPage
                });
            });
    }



    handleCheckChieldElement = (event) => {
        let categorias = this.state.categorias
        categorias.forEach(categoria => {
            if (categoria._id === event.target.value)
                categoria.isChecked = true
            else
                categoria.isChecked = false
        })
        this.setState({ categorias: categorias })
        this.loadPage(1);
    }
    _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.handleSearch();
            this.loadPage(1);

        }
    }
    addRange = (e) => {
        this.setState({
            timerange: e
        });
        this.loadPage(1)

    }

    handleSearch() {
        this.props.history.push({
            pathname: this.props.location.pathname,
            search: '?search=' + this.state.search,

        })

    }

    render() {

        if (this.state.pageSize === 0) return null;
        return (
            <div className="w-100  p-5" >
                <div className="row display" >
                    <div className="col-12" >
                        <div className="row">

                            <div className="col-12 col-md-4  mb-2">
                                <div className="form-inline">
                                    <div className="input-group">
                                        <input type="text" className="form-control" onKeyDown={this._handleKeyDown} value={this.state.search} onChange={this.handleChange} />
                                        <div className="input-group-append">
                                            <button className="btn btn-danger " onClick={this.handleSearch} >Buscar </button>

                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="col-12 col-md-3 offset-md-5 mb-2">
                                <select className="form-control w-100" onChange={this.handleCheckChieldElement}  >
                                    <option value="Disabled" >Categorie</option>
                                    {
                                        this.state.categorias.map((cat) => {
                                            return (<option key={cat._id} value={cat._id}  >{cat.name}</option>)
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                    </div>


                    <div className="col-12">
                        <Pagination
                            className="mb-2"
                            activePage={this.state.activePage}
                            totalItemsCount={this.state.itemCount}
                            itemsCountPerPage={this.state.pageSize}
                            pageRangeDisplayed={9}
                            onChange={this.onPageChanged} />
                        <div className="filter-list">
                            <div className="row">                                    {
                                this.state.items.map(function (item) {
                                    return (
                                        <div className="col-sm-12 col-md-2" key={item._id} >
                                            <Movie item={item} vermasonclick={this.vermas} />
                                        </div>
                                    );
                                }, this)
                            }
                            </div>
                        </div>
                        <Pagination
                            className="mt-2"
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

export default Catalog;