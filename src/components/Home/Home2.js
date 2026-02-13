import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import myImg from "../../Assets/avatar.svg";
import Tilt from "react-parallax-tilt";
import {
  AiFillGithub,
  AiOutlineTwitter,
  AiOutlineMail,
} from "react-icons/ai";

function Home2() {
  return (
    <Container fluid className="home-about-section" id="about">
      <Container>
        <Row>
          <Col md={8} className="home-about-description">
            <h1 style={{ fontSize: "2.6em" }}>
              Let me <span className="purple"> Introduce </span> myself
            </h1>
            <p className="home-about-body">
              Someone once told me programming is not about
              <span>
                <b className="purple"> syntax</b>
              </span>
              <b> ,</b> &nbsp;it's about the
              <span>
                <b className="purple"> logic</b>
              </span>.
              <br />
              It has been 9+ years since then, and I have
              <span>
                <b className="purple"> loved </b>
              </span>
              every bit about learning that logic.
              <br />I am fluent in
              <span>
                <b className="purple"> Java EE, Spring BOOT, Microservices, PostgreSQL, Angular 8+ etc. </b>
              </span>
              <br />
              <br />
              I love solving problems and breaking the given problem in the group of smallest possible tasks is one of my forte. &nbsp;

              <br />
              <br />
              Whenever possible, I try my best to contribute to open source community.

            </p>
          </Col>
          <Col md={4} className="myAvtar">
            <Tilt>
              <img src={myImg} className="img-fluid" alt="avatar" />
            </Tilt>
          </Col>
        </Row>
        <Row>
          <Col md={12} className="home-about-social">
            <h1><span className="purple">Connect </span>with me on</h1>

            <ul className="home-about-social-links">
              <li className="social-icons">
                <a
                  href="https://github.com/ipankajkumar"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiFillGithub />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://twitter.com/iSinghPankaj"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiOutlineTwitter />
                </a>
              </li>

              <li className="social-icons">
                <a
                  href="mailto:ipankajsingh.10+site@gmail.com"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiOutlineMail />
                </a>
              </li>


              {/* <li className="social-icons">
                <a
                  href="https://www.linkedin.com/in/"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <FaLinkedinIn />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour home-social-icons"
                >
                  <AiFillInstagram />
                </a>
              </li> */}
            </ul>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
export default Home2;
