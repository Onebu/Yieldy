import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CardBody,
  ListGroup,
  ListGroupItem,
  Collapse,
  Col,
  Row,
  CardHeader,
} from 'reactstrap';
import { Pie } from 'react-chartjs-2';
import {
  MdUnfoldMore,
  MdUnfoldLess
} from 'react-icons/md';
import { Card, Calendar, Result } from 'antd';
import * as moment from 'moment'
import * as companyActions from '../../store/actions/company';
import * as taskActions from '../../store/actions/task';
import * as deviceActions from '../../store/actions/device';
import { Page, PageSpinner } from 'components/BasicElement';


const getPieData = (data, label, labels) => {
  return {
    datasets: [
      {
        data: [data.filter(item => item.status === "WIP").length, data.filter(item => item.status === "done").length],
        backgroundColor: [
          "#6a82fb",
          "#fc5c7d",
          "#45b649",
        ],
        label: label,
      },
    ],
    labels: ["WIP", "FINISHED"],
  };
};

const DashboardPage = props => {


  const [isLoading, setIsLoading] = useState(false);
  const [showCompany, setShowCompany] = useState(true);
  const company = useSelector(state => state.company.companies[0]);
  const profile = useSelector(state => state.user.userProfile);
  const relatedDevices = useSelector(state => state.device.relatedDevices);
  const tasks = useSelector(state => state.task.fetchedRelated);
  const metrics = useSelector(state => state.device.metricList);
  let statusList = [];
  const dispatch = useDispatch();

  console.log(statusList);
  console.log(metrics)


  useEffect(() => {
    setIsLoading(true);
    async function fetchCompany() {
      await dispatch(companyActions.fetchCompany())
    }
    async function fetchTask() {
      await dispatch(taskActions.fetchRelatedTask())
    }
    async function fetchRelatedDevice() {
      await dispatch(deviceActions.fetchRelatedDevice());
    }
    fetchCompany().then(fetchTask()).then(fetchRelatedDevice()).then(setIsLoading(false));
  }, [dispatch])


  useEffect(() => {
    if (!!relatedDevices) {
      statusList = [];
      relatedDevices.map(device => {
        statusList.push(device.statusCode)
      })
      dispatch(deviceActions.fetchStatusList(statusList));
      dispatch(deviceActions.fetchMetricList(statusList));
    }
  }, [relatedDevices])


  if (isLoading || !!!company || !!!profile) {
    return (
      <PageSpinner />
    )
  }


  return (
    <Page
      className="DashboardPage"
      style={{ margin: 20 }}
    >
      <div>
        <hr className="hr-text" data-content="Dashboard" />
      </div>
      <Row>
        <Col lg="8" md="8" sm="12" xs="12" >
          <Card className="mb-4" color="info">
            <CardHeader>
              <Row className="d-flex">
                <div className="mx-8 ml-4 mr-auto">Company</div>
              </Row>
            </CardHeader>
            <CardBody>
              <ListGroup>
                <ListGroupItem action className="border-light d-flex" onClick={() => { setShowCompany(!showCompany) }} color="info">
                  <div className="mx-8 font-semibold col-md-8 mr-auto">
                    Detail
                                </div>
                  <div className="align-self-center text-red-500">
                    {showCompany ? <MdUnfoldLess /> : <MdUnfoldMore />}
                  </div>
                </ListGroupItem>
              </ListGroup>
              <Collapse isOpen={showCompany}>
                <ListGroup>
                  <ListGroupItem action className="border-light d-flex" >
                    <span className="font-semibold mr-auto col-sm-6">Name:</span>
                    <span className="col-sm-6">{company.name}</span>
                  </ListGroupItem>
                  <ListGroupItem action className="border-light d-flex" >
                    <span className="font-semibold mr-auto col-sm-6">website:</span>
                    <span className="col-sm-6">{company.website === "" ?
                      <div className="text-muted">Not set</div> :
                      company.website}
                    </span>
                  </ListGroupItem>
                  <ListGroupItem action className="border-light d-flex" >
                    <span className="font-semibold mr-auto col-sm-6">address:</span>
                    <span className="col-sm-6">{company.address === "" ?
                      <div className="text-muted">Not set</div> :
                      company.address}
                    </span>
                  </ListGroupItem>
                  <ListGroupItem action className="border-light d-flex" >
                    <span className="font-semibold mr-auto col-sm-6">email:</span>
                    <span className="col-sm-6">
                      <span>{company.email === "" ?
                        <div className="text-muted">Not set</div> :
                        company.email}
                      </span>
                    </span>
                  </ListGroupItem>
                  <ListGroupItem action className="border-light d-flex " >
                    <span className="font-semibold mr-auto col-sm-6">Contact phone:</span>
                    <span className="col-sm-6">{company.phone === "" ?
                      <div className="text-muted">Not set</div> :
                      company.phone}
                    </span>
                  </ListGroupItem>
                  <ListGroupItem action className="border-light d-flex" >
                    <span className="font-semibold mr-auto col-sm-6">Registration Date:</span>
                    <span className="col-sm-6">{company.registrationdate === "" ?
                      <div className="text-muted">Not set</div> :
                      moment(company.registrationdate).format('YYYY-MM-DD')}
                    </span>
                  </ListGroupItem>
                  <ListGroupItem action className="border-light d-flex" >
                    <span className="font-semibold mr-auto col-sm-6">Description:</span>
                    <span className="col-sm-6">{!!!company.description ?
                      <div className="text-muted">Not set</div> :
                      company.description}
                    </span>
                  </ListGroupItem>
                </ListGroup>
              </Collapse>
            </CardBody>
          </Card>
          <div>
            <hr className="hr-text" data-content="Company Devices Shortcut" />
          </div>
          <Row>
            {!!metrics && metrics.map((metric, i) => {
              if (!!metric
                && metric.data.length > 0
                && relatedDevices.map((device) => {
                  return device.statusCode
                }).includes(metric.data[0]._source.fields.statuscode)) {
                return <Col key={i} lg="6" md="6" sm="12" xs="12" >
                  {!!metric && metric.data.length > 0 ? <div> <Card >
                    <CardHeader>
                      <Row className="d-flex">
                        <div className="mx-8 ml-4 mr-auto">{"Device " + (i + 1) + "'s Detail"}</div>
                        <div className="align-self-center text-red-500 mr-4 cursor-pointer"
                          onClick={() => props.history.push('/system', {
                            systemId: relatedDevices.filter((device) => {
                              console.log(device);
                              return device.statusCode === metric.data[0]._source.fields.statuscode
                            })[0].system
                          })}>
                          Go to System
                                    </div>
                      </Row>
                    </CardHeader>
                    <br />
                    <div className="mx-8 ml-4 mr-auto">
                      <p>Name: <strong>{
                        relatedDevices.filter((device) => {
                          console.log(device);
                          return device.statusCode === metric.data[0]._source.fields.statuscode
                        })[0].name
                      }</strong></p>
                      <p>Arch: <strong>{metric.data[0]._source.host.architecture}</strong></p>
                      <p>hostname: <strong>{metric.data[0]._source.host.hostname}</strong></p>
                      <p>Os family: <strong>{metric.data[0]._source.host.os.family}</strong></p>
                      <p>Os vcersion: <strong>{metric.data[0]._source.host.os.version}</strong></p>
                      <p>Os Build: <strong>{metric.data[0]._source.host.os.build}</strong></p>
                      <p>Os kernel: <strong>{metric.data[0]._source.host.os.kernel}</strong></p>
                      <p>Os system: <strong>{metric.data[0]._source.host.os.name}</strong></p>
                      <p>Last Updated: <strong>{moment(new Date(metric.data[0]._source["@timestamp"])).format("MM-DD HH:mm")}</strong></p>
                    </div>
                  </Card>
                    <br />
                  </div> : <Card >
                      <CardHeader>
                        <Row className="d-flex">
                          <div className="mx-8 ml-4 mr-auto">{"Device " + (i + 1) + "'s Detail"}</div>
                          <div className="align-self-center text-red-500 mr-4 cursor-pointer"
                            onClick={() => props.history.push('/system', {
                              systemId: relatedDevices[i].system
                            })}>
                            Go to System
                                    </div>
                        </Row>
                      </CardHeader>
                      <p>Name: <strong>{
                        relatedDevices[i].name
                      }</strong></p>
                      <Result
                        status="404"
                        title="404"
                        subTitle="Not record has found, Please configure beats"
                      />
                    </Card>
                  }
                </Col>
              }
            })}
          </Row>
        </Col>
        <Col lg="4" md="4" sm="12" xs="12">
          <Card>
            <CardHeader>
              Calendar
            </CardHeader>
            <Calendar fullscreen={false} />
          </Card>
          <br />
          {!!tasks &&
            <Card>
              <CardHeader>Related Task</CardHeader>
              <CardBody>
                <Pie data={getPieData(tasks)} />
              </CardBody>
            </Card>
          }
        </Col>
      </Row>
    </Page >
  );
}
export default DashboardPage;
