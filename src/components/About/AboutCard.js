import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi Everyone, I'm <span className="purple">Pankaj Kumar </span>, a passionate software engineer with over 9+ years of experience in insurance, shipping &amp; logistics domain. I have worked across all phases of <span className="purple">SDLC</span>.<br /> I have my <span className="purple">B.Tech</span> degree focused in <span className="purple">Information Technology</span> from <span className="purple">University of Pune, India</span>. I have worked with a range of different languages, frameworks, databases and I am always looking for opportunities to work on something new.


            <br />
            <br />
            Apart from coding, some other activities that I love to do!
          </p>
          <ul>
            <li className="about-activity">
              <ImPointRight /> Read about latest technologies.
            </li>
            <li className="about-activity">
              <ImPointRight /> Read about Space, science and rockets.
            </li>
            <li className="about-activity">
              <ImPointRight /> Travelling.
            </li>
            <li className="about-activity">
              <ImPointRight /> Eat ( oh! yes I am a foodie ).
            </li>
          </ul>

          <p style={{ marginBlockEnd: "15px", color: "rgb(155 126 172)" }}>
            "Code, not to write syntax but to solve problems."{" "}
          </p>
          <footer className="blockquote-footer">Pankaj Kumar</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
