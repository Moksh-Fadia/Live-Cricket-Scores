window.onload = function() {
    showMatchList();
};

window.matchInfoMap = {};       

function showMatchList() {
    fetch("https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live", {
      method: "GET",
      headers: {
        "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
        "x-rapidapi-key": "c6dd98b5d8msh58cccc3530105bfp1eb6b9jsn46879c5228dd"
      }
    })
      .then(function(response) { 
        return response.json(); 
    })
      .then(function(data) {
        console.log("API Data:", data);

        const app = document.getElementById("app");
        app.className = "match-list";
        app.innerHTML = "";
  
        let matches = [];
        const typeMatches = data.typeMatches;

        for (let i = 0; i < typeMatches.length; i++) {
          const seriesMatches = typeMatches[i].seriesMatches;
          
          for (let j = 0; j < seriesMatches.length; j++) {
            const wrapper = seriesMatches[j].seriesAdWrapper;
            
            if (wrapper && wrapper.matches) {    
              matches = matches.concat(wrapper.matches);
            }
          }
        }        
  
        if (matches.length === 0) {
          app.innerHTML = "No live matches found";
        }
        else {
            for (var i = 0; i < matches.length; i++) {
                const info = matches[i].matchInfo; 
                const team1 = info.team1.teamName;
                const team2 = info.team2.teamName;
                const status = info.status || "Status unknown";
                const matchId = info.matchId;
        
                window.matchInfoMap[matchId] = info;    

                app.innerHTML +=
                    "<div class='match-card' onclick='selectMatch(" + matchId + ")'>" +
                    "<h3>" + team1 + " vs " + team2 + "</h3>" +
                    "<p>Status: " + status + "</p>" +
                    "</div>";
        }
    }
})
    .catch(function(e) {
        console.log("Error in match list", e);
    });   
}


function selectMatch(id) {
    var matchInfo = window.matchInfoMap[id];    
    showScorecard(id, matchInfo);
}
 

function showScorecard(matchId, matchInfo) {
    fetch("https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/" + matchId + "/hscard", {
        method: "GET",
        headers: {
            "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
            "x-rapidapi-key": "c6dd98b5d8msh58cccc3530105bfp1eb6b9jsn46879c5228dd"
        }
    })
    .then(function(response) { 
        return response.json();
    })
    .then(function(data) {
        console.log("Scorecard API data:", data);

        const app = document.getElementById("app");
        app.className = "scorecard";
        app.innerHTML = "";

        const matchHeader = data.matchHeader;
        const team1 = matchHeader.team1.shortName || matchHeader.team1.name;
        const team2 = matchHeader.team2.shortName || matchHeader.team2.name;
        const status = matchHeader.status || "No status";

        const format = matchInfo.matchFormat || "Unknown Format";
        const venue = matchInfo.venueInfo.ground + ", " + matchInfo.venueInfo.city;

        app.innerHTML =
        "<div><b>" + team1 + " vs " + team2 + "</b></div>" +
        "<div>Status: " + status + "</div>" +
        "<div>Format: " + format + "</div>" +
        "<div>Venue: " + venue + "</div>" +
        "<div><b>Scores:</b></div>" ;

      // player details
        let temp = "";
        let scoreCardArr = data.scoreCard || [];

        if (scoreCardArr.length === 0) {
            app.innerHTML += "<div>No player stats available</div>";
            app.innerHTML += '<button onclick="goBack()">Back</button>';
            return;
        }

        for (let i = 0; i < scoreCardArr.length; i++) {
            let innings = scoreCardArr[i];

            let batTeam = innings.batTeamDetails.batTeamName || innings.batTeamDetails.batTeamShortName;
            let runs = innings.scoreDetails.runs;
            let wickets = innings.scoreDetails.wickets;
            let overs = innings.scoreDetails.overs;

            temp += `<div><strong>${batTeam}:</strong> ${runs}/${wickets} in ${overs} overs</div>`;

       // batting stats
        let batters = Object.values(innings.batTeamDetails.batsmenData);  // object.values() takes all the values in the object and puts them in an array 
        
        if (batters.length > 0) {
                temp += "<div style='margin-top: 1rem;'>Batting</div>";

                temp += `
                <table class='stat-table'>
                    <tr>
                    <th>Name</th> 
                    <th>R</th>
                    <th>B</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>How Out</th>
                    </tr>
                `;

            for (let b of batters) {
                temp += "<tr>" +
                    "<td>" + (b.batName) + "</td>" +
                    "<td>" + (b.runs) + "</td>" +
                    "<td>" + (b.balls) + "</td>" +
                    "<td>" + (b.fours) + "</td>" +
                    "<td>" + (b.sixes) + "</td>" +
                    "<td>" + (b.outDesc) + "</td>" +
                    "</tr>";
            }
            temp += "</table>";
        } else {
            temp += "<div>No batting stats available.</div>";
        }

       // bowling stats
       let bowlers = Object.values(innings.bowlTeamDetails.bowlersData);

       if (bowlers.length > 0) {
           temp += "<div style='margin-top: 1rem;'>Bowling</div>";
           temp += `
             <table class='stat-table'>
               <tr>
                 <th>Name</th>
                 <th>Overs</th>
                 <th>Maidens</th>
                 <th>Runs</th>
                 <th>Wickets</th>
               </tr>
           `; 

           for (let bw of bowlers) {
                temp += "<tr>" +
                    "<td>" + (bw.bowlName) + "</td>" +
                    "<td>" + (bw.overs) + "</td>" +
                    "<td>" + (bw.maidens) + "</td>" +
                    "<td>" + (bw.runs) + "</td>" +
                    "<td>" + (bw.wickets) + "</td>" +
                    "</tr>";
            }
            temp += "</table>";
        } else {
            temp += "<div>No bowling stats available.</div>";
    }
}
      temp += '<button onclick="goBack()">Back</button>';
      temp += `<button style="margin-left:0.8rem" onclick="refreshScorecard(this)" data-matchid="${matchId}">Refresh</button>`;
      app.innerHTML += temp;
 })
    .catch(function(err) {
        console.log("Error:", err);
        app.innerHTML = "<div>Could not load match details.</div><button onclick='goBack()'>Back</button>";
    });
}


function refreshScorecard(btn) {
    var matchId = btn.getAttribute('data-matchid');
    var matchInfo = window.matchInfoMap[matchId];
    showScorecard(matchId, matchInfo);
}


function goBack() {
    showMatchList();
}
