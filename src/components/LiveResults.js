import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Grid, LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  candidateCard: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    width: '100%',
  },
  progressBar: {
    marginTop: theme.spacing(2),
    height: 20,
    borderRadius: 10,
  },
  totalVotes: {
    marginTop: theme.spacing(3),
    textAlign: 'center',
  },
}));

function LiveResults() {
  const classes = useStyles();
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    loadResults();
    setupEventListener();
  }, []);

  const setupEventListener = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        contract.on('VoteCast', (candidateId, voter) => {
          loadResults();
        });

        return () => {
          contract.removeAllListeners();
        };
      }
    } catch (error) {
      console.error('Error setting up event listener:', error);
    }
  };

  const loadResults = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        const candidatesCount = await contract.getCandidatesCount();
        const candidatesData = [];
        let total = 0;
        
        for (let i = 1; i <= candidatesCount.toNumber(); i++) {
          const candidate = await contract.getCandidate(i);
          const voteCount = candidate[2].toNumber();
          total += voteCount;
          candidatesData.push({
            id: candidate[0].toNumber(),
            name: candidate[1],
            voteCount: voteCount,
          });
        }
        
        setCandidates(candidatesData);
        setTotalVotes(total);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  return (
    <Container component="main" maxWidth="md" className={classes.container}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h5" gutterBottom>
          Live Voting Results
        </Typography>
        <Grid container spacing={3}>
          {candidates.map((candidate) => (
            <Grid item xs={12} key={candidate.id}>
              <Paper className={classes.candidateCard}>
                <Typography variant="h6">{candidate.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Votes: {candidate.voteCount}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0}
                  className={classes.progressBar}
                />
                <Typography variant="body2" align="right">
                  {totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0}%
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Typography variant="h6" className={classes.totalVotes}>
          Total Votes Cast: {totalVotes}
        </Typography>
      </Paper>
    </Container>
  );
}

export default LiveResults; 