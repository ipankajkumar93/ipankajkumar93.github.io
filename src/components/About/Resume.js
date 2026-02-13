import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";

import Resumecontent from "./ResumeContent";

import { AiOutlineFilePdf } from "react-icons/ai";

function Resume() {



  return (
    // <Container fluid className="resume-section">
    //   <Particle />
    <Container>
      {/* <Row style={{ justifyContent: "center", position: "relative" }}>
          <Button variant="primary" href={pdf} target="_blank">
            <AiOutlineDownload />
            &nbsp;Download CV
          </Button>
        </Row> */}
      <Row className="resume">
        <Col md={6} className="resume-left">
          <h3 className="resume-title"><span className="purple">Exp</span>erience</h3>
          <Resumecontent
            title="Senior Software Engineer"
            org="Bitwise Inc"
            date="July 2022 - Present"
            content={[
              "Design and develop Campaign Acquisition Portal to manage all the credit card offers and campaigns offered to customers based on customer spending capacity, credit score, etc.",
            ]}
          />
          <Resumecontent
            title="Full Stack Developer"
            org="Scan IT India"
            date="February 2020 - July 2022"
            content={[
              "Design and develop Warehouse module within the flagship product PHOENIX to be used by customers to create and track the booking of cargo/containers and manage the entire lifecycle of the container to/from warehouse.",
            ]}
          />

          <Resumecontent
            title="Associate Software Engineer"
            org="GFI Informatique, Qatar-Doha"
            date="December 2017 - January 2020"
            content={[
              "Designed a system that extracts the data from all insurance companies into a single database and pushes it to traffic department in real time for Qatar Financial Center.",
            ]}
          />

          <Resumecontent
            title="Software Trainee"
            org="Tech Mahindra Ltd, Pune"
            date="June 2016 - July 2017"
            content={[
              "Designed & developed an interface for the authorized users to execute numerous processes like inspection, manipulation, modelling and derivations to draw required results for internal organizational services.",
            ]}
          />


        </Col>
        <Col md={6} className="resume-right">
          <h3 className="resume-title"><span className="purple">Edu</span>cation</h3>
          <Resumecontent
            title="B.Tech, Information Technology"
            org="Sinhgad Institutes, University of Pune, India"
            date="2012 - 2016"
            content={["Percentage: 66%"]}
          />
          <Resumecontent
            title="HSC [ 12th ]"
            org="Air Force School Pune, India"
            date="2011"
            content={["Percentage: 70%"]}
          />
          <Resumecontent
            title="SSC [ 10th ]"
            org="Air Force School Pune, India"
            date="2009"
            content={["Percentage: 86%"]}
          />

          {/* <h3 className="resume-title"><span className="purple">Extra</span>curricular Activities</h3>
            <Resumecontent
              title="Developer"
              org ="Covid Tracker"
              content={[
                "An initiative to make life easier by automating covid vaccination slots look up in India using Angular.",
              ]}
            /> */}
          <h3 className="resume-title"><span className="purple">Achieve</span>ments</h3>
          <Resumecontent
            title=""
            content={[
              "Vice President, Sinhgad Institutes - 01/2015 ",
              "Co-General Secretary, Sinhgad Institutes - 09/2015",
              "Student Ambassador, Sinhgad Institutes - 02/2016",

            ]}
          />
        </Col>
      </Row>
      <Row style={{ justifyContent: "center", position: "relative" }}>
        <Button variant="primary" href="https://drive.google.com/file/d/14Gg-Q0WrxIbndithBzzKcozwFbl5HUaQ/view?usp=sharing" target="_blank" style={{ maxWidth: "250px" }}>
          <AiOutlineFilePdf />&nbsp;Hire me
        </Button>
      </Row>
    </Container>
    // </Container>
  );
}

export default Resume;
