import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
const NavBar = () => {
    return(
        <div>
        <AppBar position="static" style={{ background: '#2E3B55', marginLeft: 240, width: 'calc(100% - 240px)' }}>
            <Toolbar>
                <Typography variant="title" color="inherit" style = {{ fontSize: "1.25rem"}}>
                Mars Rover
                </Typography>
            </Toolbar>
        </AppBar>
        </div>
    )
}
export default NavBar;
