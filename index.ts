import http from 'http'
import express from 'express'
import { Server } from "socket.io"
import dotenv from 'dotenv'

dotenv.config()

const {
    PORT = 80
} = process.env

const socketio_options = {
    cors: { origin: '*' }
}

const app = express()
const server = http.createServer(app)
const io = new Server(server, socketio_options)

app.get('/', (req, res, next) => {
    res.send('State synchronizer server')
})

io.on('connection', (socket) => {

    const {id} = socket

    console.log(`Socket ${id} connected`)

    // Announce connection to other clients
    socket.broadcast.emit('clientConnected', {id})

    socket.on('stateUpdate', (state) => {
        // The client states have been updated
        socket.broadcast.emit('clientStateUpdated', { id, state})
    })


    socket.on('disconnect', (reason) => {

        // tell other clients that this one has diconnected
        socket.broadcast.emit('clientDisconnected', {id})

        console.log(`Client ${id} disconnected, reason: ${reason}`)
    })


})


server.listen(PORT, () => { console.log(`Server listening on port ${PORT}`)})