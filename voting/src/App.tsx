import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import {Voting  } from './contracts/voting';
import { ScryptProvider, Scrypt, ContractCalledEvent, 
   PandaSigner, ByteString,} from 'scrypt-ts';
  import {
    TableContainer,Table,TableHead,TableRow,TableCell,TableBody,Paper,Button,Snackbar,Alert,
    Link,Typography,Box,Divider,
  } from "@mui/material";

// `npm run deploycontract` to get deployment transaction id
const contract_id = {
  /** The deployment transaction id */
  txId: "ef478e672c00ef47fed47cd55e0b96c907918779853c45626286ec50200ac972",
  /** The output index */
  outputIndex: 0,
};
function byteString2utf8(b: ByteString) {
  return Buffer.from(b, "hex").toString("utf8");
}
function App() {
  const [votingContract, setContract] = useState<Voting>();
  const signerRef = useRef<PandaSigner>();
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState<{
    txId: string;
    candidate: string;
  }>({
    txId: "",
    candidate: "",
  });



  async function fetchContract() {
    try {
      const instance = await Scrypt.contractApi.getLatestInstance(
        Voting,
        contract_id
      );
      setContract(instance);
    } catch (error: any) {
      console.error("fetchContract error: ", error);
      setError(error.message);
    }
  }

  useEffect(() => {

    const provider = new ScryptProvider();
    const signer = new PandaSigner(provider);

    signerRef.current = signer;
    
    fetchContract();

    const subscription = Scrypt.contractApi.subscribe(
      {
        clazz: Voting,
        id: contract_id,
      },
      (event: ContractCalledEvent<Voting>) => {
        setSuccess({
          txId: event.tx.id,
          candidate: event.args[0] as ByteString,
        });
        setContract(event.nexts[0]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  
  

  async function voting(e: any) {
  
    const signer = signerRef.current as PandaSigner
    const { isAuthenticated, error } = await signer.requestAuth();

    if (!isAuthenticated) {
            throw new Error(error);
          }

    if(!signer) {
      alert("Please connect a wallet first!");
      return;
    }

    if (votingContract) {
      await votingContract.connect(signer);
      // create the next instance from the current
      const nextInstance = votingContract.next();

      const carBrand = e.target.name;

      // update state
      nextInstance.increaseVotesReceived(carBrand);

      // call the method of current instance to apply the updates on chain
      votingContract.methods
        .vote(carBrand, {
          next: {
            instance: nextInstance,
            balance: votingContract.balance,
          },
        })
        .then((result) => {
          console.log(`Voting call tx: ${result.tx.id}`);
        })
        .catch((e) => {
          setError(e.message);
          fetchContract();
          console.error("call error: ", e);
        });
    }
  }

    
  return (
    <div className="App">
        <h2>Vote for your favorite Car Brand</h2>
      <TableContainer
        component={Paper}
        variant="outlined"
        style={{ width: 1200, height: "80vh", margin: "auto" }}
      >
        <Table className='table-wrapper'>
          <TableHead >
            <TableRow className='table-head'>
              <TableCell align="center"><b>TOYOTA</b></TableCell>
              <TableCell align="center"><b>MAZDA</b></TableCell>
              <TableCell align="center"><b>BENZ</b></TableCell>
              <TableCell align="center"><b>HONDA</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="center">
                <Box>
                  <Box
                    sx={{
                      height: 150,
                    }}
                    component="img"
                    alt={"Toyota"}
                    src={`${process.env.PUBLIC_URL}/${"Toyota"}.png`}
                  />
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box>
                  <Box
                    sx={{
                      height: 150,
                    }}
                    component="img"
                    alt={"mazda"}
                    src={`${process.env.PUBLIC_URL}/${"mazda"}.png`}
                  />
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box>
                  <Box
                    sx={{
                      height: 150,
                    }}
                    component="img"
                    alt={"benz"}
                    src={`${process.env.PUBLIC_URL}/${"benz"}.png`}
                  />
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box>
                  <Box
                    sx={{
                      height: 150,
                    }}
                    component="img"
                    alt={"honda"}
                    src={`${process.env.PUBLIC_URL}/${"honda"}.png`}
                  />
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">
                <Box>
                  <Typography variant={"h1"}>
                    {votingContract?.cars[0].votesReceived.toString()}
                  </Typography>
                  <Button
                  className='votingBtn'
                    variant="contained"
                    onClick={voting}
                    name={votingContract?.cars[0].name}
                  >
                    VOTE
                  </Button>
                </Box>
              </TableCell>

              <TableCell align="center">
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant={"h1"}>
                    {votingContract?.cars[1].votesReceived.toString()}
                  </Typography>
                  <Button
                  className='votingBtn'
                    variant="contained"
                    onClick={voting}
                    name={votingContract?.cars[1].name}
                  >
                    VOTE
                  </Button>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Box>
                  <Typography variant={"h1"}>
                    {votingContract?.cars[2].votesReceived.toString()}
                  </Typography>
                  <Button
                  className='votingBtn'
                    variant="contained"
                    onClick={voting}
                    name={votingContract?.cars[2].name}
                  >
                    VOTE
                  </Button>
                </Box>
              </TableCell>

              <TableCell align="center">
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant={"h1"}>
                    {votingContract?.cars[3].votesReceived.toString()}
                  </Typography>
                  <Button
                  className='votingBtn'
                    variant="contained"
                    onClick={voting}
                    name={votingContract?.cars[3].name}
                  >
                    VOTE
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

       
      </TableContainer>
      
      <Snackbar
        open={error !== ""}
        autoHideDuration={6000}
  
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={success.candidate !== "" && success.txId !== ""}
        autoHideDuration={6000}
    
      >
        <Alert severity="success">
          {" "}
          <Link
            href={`https://test.whatsonchain.com/tx/${success.txId}`}
            target="_blank"
            rel="noreferrer"
          >
            {`"${byteString2utf8(success.candidate)}" got one vote,  tx: ${
              success.txId
            }`}
          </Link>
        </Alert>
      </Snackbar>
    </div>
      
  
  );

}
;
export default App;
