import React, { Component } from 'react';
import Land from "../artifacts/Land.json";
import getWeb3 from "../getWeb3";
import { Line, Bar } from "react-chartjs-2";
import '../index.css';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { DrizzleProvider } from 'drizzle-react';
import { Spinner } from 'react-bootstrap'
import {
    LoadingContainer,
    AccountData,
    ContractData,
    ContractForm
} from 'drizzle-react-components'

// reactstrap components
import {
    Button,
    ButtonGroup,
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    FormGroup,
    Input,
    Table,
    Row,
    Col,
    UncontrolledTooltip,
} from "reactstrap";

// core components
import {
    chartExample1,
    chartExample2,
    chartExample3,
    chartExample4,
} from "../variables/charts";

const drizzleOptions = {
    contracts: [Land]
}

// var buyers = 0;
// var sellers = 0;
var sellerTable = [];
var completed = true;

class SellerInfo extends Component {
    constructor(props) {
        super(props)

        this.state = {
            LandInstance: undefined,
            account: null,
            web3: null,
            sellers: 0,
            verified: '',
        }
    }

    verifySeller = (item) => async () => {
        //console.log("Hello");
        //console.log(item);

        await this.state.LandInstance.methods.verifySeller(
            item
        ).send({
            from: this.state.account,
            gas: 2100000
        });

        //Reload
        window.location.reload(false);

    }

    componentDidMount = async () => {
        //For refreshing page only once
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }

        try {
            //Get network provider and web3 instance
            const web3 = await getWeb3();

            const accounts = await web3.eth.getAccounts();

            const currentAddress = await web3.currentProvider.selectedAddress;
            //console.log(currentAddress);
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = Land.networks[networkId];
            const instance = new web3.eth.Contract(
                Land.abi,
                deployedNetwork && deployedNetwork.address,
            );

            this.setState({ LandInstance: instance, web3: web3, account: accounts[0] });


            var sellersCount = await this.state.LandInstance.methods.getSellersCount().call();
            console.log(sellersCount);

            var sellersMap = [];
            
            sellersMap = await this.state.LandInstance.methods.getSeller().call();
            
            var verified = await this.state.LandInstance.methods.isLandInspector(currentAddress).call();
            //console.log(verified);
            this.setState({ verified: verified });


            for (let i = 0; i < sellersCount; i++) {
                var seller = await this.state.LandInstance.methods.getSellerDetails(sellersMap[i]).call();
                console.log(seller);
                var seller_verify = await this.state.LandInstance.methods.isVerified(sellersMap[i]).call();
                console.log(seller_verify);

                sellerTable.push(<tr><td>{i + 1}</td><td>{sellersMap[i]}</td><td>{seller[0]}</td><td>{seller[1]}</td><td>{seller[2]}</td><td>{seller[3]}</td><td>{seller[4]}</td>
                    <td>
                        <Button onClick={this.verifySeller(sellersMap[i])} disabled={seller_verify} className="button-vote">
                            Verify
                    </Button>
                    </td></tr>)


            }

            console.log(sellerTable);


        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };



    render() {
        if (!this.state.web3) {
            return (
                <div>
                    <div>
                        <h1>
                            <Spinner animation="border" variant="primary" />
                        </h1>
                    </div>

                </div>
            );
        }

        if (!this.state.verified) {
            return (
                <div className="content">
                    <div>
                        <Row>
                            <Col xs="6">
                                <Card className="card-chart">
                                    <CardBody>
                                        <h1>
                                            You are not verified to view this page
                                        </h1>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                </div>
            );
        }

        return (
            <DrizzleProvider options={drizzleOptions}>
                <LoadingContainer>
                    <div className="content">

                        <Row>
                            <Col lg="4">
                                <Card className="card-chart">
                                    <CardHeader>
                                        <h5 className="card-category">Total Requests for land</h5>
                                        <CardTitle tag="h3">
                                            <i className="tim-icons icon-bell-55 text-info" /> 10
                                         </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="chart-area">
                                            <Line
                                                data={chartExample2.data}
                                                options={chartExample2.options}
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col lg="4">
                                <Card className="card-chart">
                                    <CardHeader>
                                        <h5 className="card-category">Daily Transactions</h5>
                                        <CardTitle tag="h3">
                                            <i className="tim-icons icon-delivery-fast text-primary" />{" "}
                    3-5
                  </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="chart-area">
                                            <Bar
                                                data={chartExample3.data}
                                                options={chartExample3.options}
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col lg="4">
                                <Card className="card-chart">
                                    <CardHeader>
                                        <h5 className="card-category">Successful Transactions</h5>
                                        <CardTitle tag="h3">
                                            <i className="tim-icons icon-send text-success" /> 120
                  </CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="chart-area">
                                            <Line
                                                data={chartExample4.data}
                                                options={chartExample4.options}
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs="12">
                                <Card>
                                    <CardHeader>
                                        <CardTitle tag="h4">Sellers Info</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <Table sclassName="tablesorter" responsive color="black">
                                            <thead className="text-primary">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Account Address</th>
                                                    <th>Name</th>
                                                    <th>Age</th>
                                                    <th>Aadhar Number</th>
                                                    <th>Pan Number</th>
                                                    <th>Owned Lands</th>
                                                    <th>Verify Seller</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sellerTable}
                                            </tbody>

                                        </Table>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>


                    </div>
                </LoadingContainer>
            </DrizzleProvider>
        );

    }
}

export default SellerInfo;
