import React from "react";
//import "./Highscores.css";

const Highscores = (highscores) => {

    return (
        <div>
      <h1>Highscores</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {highscores && highscores.map((score, index) => (
            <tr key={score.id}>
              <td>{index + 1}</td>
              <td>{score.player_name}</td> 
              <td>{score.score}</td>
              <td>{score.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Highscores;