import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, Grid, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
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
    textAlign: 'center',
  },
  voteButton: {
    marginTop: theme.spacing(2),
  },
  walletButton: {
    marginBottom: theme.spacing(3),
  },
}));

function Vote() {
  const classes = useStyles();
  const [candidates, setCandidates] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    checkWalletConnection();
    if (walletConnected) {
      loadCandidates();
    }
  }, [walletConnected]);

  const checkWalletConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        setWalletConnected(accounts.length > 0);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        setWalletConnected(true);
        setSnackbarMessage('Wallet connected successfully!');
        setSeverity('success');
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage('Please install MetaMask to vote!');
        setSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setSnackbarMessage('Error connecting wallet. Please try again.');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const loadCandidates = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const candidatesCount = await contract.getCandidatesCount();
      const candidatesData = [];
      
      for (let i = 1; i <= candidatesCount.toNumber(); i++) {
        const candidate = await contract.getCandidate(i);
        candidatesData.push({
          id: candidate[0].toNumber(),
          name: candidate[1],
          voteCount: candidate[2].toNumber(),
        });
      }
      
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setSnackbarMessage('Error loading candidates. Please try again.');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleVote = async (candidateId) => {
    try {
      if (!walletConnected) {
        setSnackbarMessage('Please connect your wallet first!');
        setSeverity('error');
        setOpenSnackbar(true);
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.vote(candidateId);
      setSnackbarMessage('Processing vote... Please wait.');
      setSeverity('info');
      setOpenSnackbar(true);
      
      await tx.wait();
      
      setSnackbarMessage('Vote cast successfully!');
      setSeverity('success');
      setOpenSnackbar(true);
      
      loadCandidates();
    } catch (error) {
      console.error('Error casting vote:', error);
      let errorMessage = 'Error casting vote. ';
      if (error.message.includes('You have already voted')) {
        errorMessage = 'You have already cast your vote!';
      } else {
        errorMessage += 'Please try again.';
      }
      setSnackbarMessage(errorMessage);
      setSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="md" className={classes.container}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h5" gutterBottom>
          Cast Your Vote
        </Typography>
        
        {!walletConnected && (
          <Button
            variant="contained"
            color="primary"
            className={classes.walletButton}
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        )}

        <Grid container spacing={3}>
          {candidates.map((candidate) => (
            <Grid item xs={12} sm={4} key={candidate.id}>
              <Paper className={classes.candidateCard}>
                <Typography variant="h6">{candidate.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Current Votes: {candidate.voteCount}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.voteButton}
                  onClick={() => handleVote(candidate.id)}
                  disabled={!walletConnected}
                >
                  Vote
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Vote; 