import React, { Component } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Map from './Map.js';
import Card from '@material-ui/core/Card';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
  display: 'flex',
  },
  appBar: {
   width: `calc(100% - ${drawerWidth}px)`,
   marginLeft: drawerWidth,
 },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  paper: {
   padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
 },
}));

export default function Home(){
  const classes = useStyles();
    return (
      <div>
      <CssBaseline />
      <main className={classes.content} style = {{marginLeft: 240}}>
        <div className={classes.toolbar} />
        <div className = {classes.root} >
          <Grid container spacing={3}>
            <Grid container item xs={6} sm={6} >
              <Card className={classes.paper} style = {{width:"100%", minheight:"100%"}}>
              Map
                <Map/>
              </Card>
            </Grid>
            <Grid container spacing = {3}>
              <Grid container item xs={6} sm={6} >
                <Card className={classes.paper}>
                Commands

                </Card>
              </Grid>
              <Grid container item xs={6} sm={6} >
                <Card className={classes.paper}>
                Notifications

                </Card>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </main>
      </div>
    );
  }
