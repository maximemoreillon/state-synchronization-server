import http from 'http'
import express from 'express'
import dotenv from 'dotenv'
import { Server } from 'socket.io'

dotenv.config()

const {
    PORT = 80
} = process.env

const cors = { origin: '*' }

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors })

app.get('/', (req, res, next) => {
    res.send('State synchronizer server')
})

io.on('connection', (socket) => {

    const {id} = socket

    console.log(`Socket ${id} connected`)

    // Announce connection to other clients
    socket.broadcast.emit('clientConnected', {id})

    
    socket.on('disconnect', (reason) => {
        console.log(`Client ${id} disconnected, reason: ${reason}`)

        // Tell other clients that this one has diconnected
        socket.broadcast.emit('clientDisconnected', {id})
    })

    socket.on('stateUpdate', (state) => {
        // The client states have been updated, tell others about it
        socket.broadcast.emit('clientStateUpdated', { id, state })
    })

})


server.listen(PORT, () => { console.log(`Server listening on port ${PORT}`)})