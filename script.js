let canvas = document.getElementById('canvas')
let c = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
c.imageSmoothingEnabled = false
class Vector2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    add(that) {
        return new Vector2(this.x + that.x, this.y + that.y)
    }
    multiply(that) {
        return new Vector2(this.x * that, this.y * that)
    }
    toPolar() {
        return {
            a: Math.atan2(this.y, this.x),
            r: Math.sqrt(this.x ** 2 + this.y ** 2)
        }
    }
    normalize() {
        return Vector2.polar(this.toPolar().a, 1)
    }
    inBoundsRect(thatMin, thatMax) {
        let relativeThis = this.add(thatMin.multiply(-1))
        return (
            (
                0 < relativeThis.x
                &&
                relativeThis.x < thatMax.x
            )
            &&
            (
                0 < relativeThis.y
                &&
                relativeThis.y < thatMax.y
            )
        )
    }
    floor() {
        return new Vector2(Math.floor(this.x), Math.floor(this.y))
    }
}
Vector2.unit = new Vector2(1, 1)
Vector2.zero = new Vector2(0, 0)
Vector2.polar = (a, r) => {
    return new Vector2(Math.cos(a), Math.sin(a)).multiply(r)
}
Vector2.random = () => {
    return new Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1)
}
class Colour {
    constructor(r, g, b, a) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
}
Colour.white = new Colour(255, 255, 255, 1)
Colour.black = new Colour(0, 0, 0, 1)
Colour.red = new Colour(255, 0, 0, 1)
Colour.green = new Colour(0, 255, 0, 1)
Colour.blue = new Colour(0, 0, 255, 1)
Colour.random = () => {
    return new Colour(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1)
}
Colour.blend = (colour, otherColour, ratio = 0.5) => {
    let r = Math.round(colour.r * ratio + otherColour.r * (1 - ratio))
    let g = Math.round(colour.g * ratio + otherColour.g * (1 - ratio))
    let b = Math.round(colour.b * ratio + otherColour.b * (1 - ratio))
    let a = Math.round(colour.a * ratio + otherColour.a * (1 - ratio))
    return new Colour(r, g, b, a)
}
function drawRect(pos, dim, colour) {
    c.fillStyle = `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`
    c.fillRect(pos.x, pos.y, dim.x, dim.y)
}
function drawLine(list, colour) {
    c.strokeStyle = `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`
    c.beginPath()
    c.moveTo(list[0].x, list[0].y)
    for (let i of list) {
        c.lineTo(i.x, i.y)
    }
    c.stroke()
}
function drawPoly(list, colour) {
    c.strokeStyle = `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`
    c.beginPath()
    c.moveTo(list[0].x, list[0].y)
    for (let i of list) {
        c.lineTo(i.x, i.y)
    }
    c.stroke()
    c.fill()
}
function drawArc(pos, rad, sa, ea, clock, colour) {
    c.strokeStyle = `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`
    c.fillStyle = `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`
    c.beginPath()
    c.arc(pos.x, pos.y, rad, sa, ea, !clock)
    c.stroke()
    c.fill()
}
function drawImg(img, cropPos, cropDim, pos, dim) {
    c.drawImage(img, cropPos.x, cropPos.y, cropDim.x, cropDim.y, pos.x, pos.y, dim.x, dim.y)
}
function write(text, pos, colour) {
    c.font = '20px Arial'
    c.fillStyle = `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`
    c.fillText(text, pos.x, pos.y)
}
function clear() {
    c.clearRect(0, 0, window.innerWidth, window.innerHeight)
}
function drawColouredSprite(pos, dim, colour) {
    let img = new Image()
    img.src = 'Sprites/slime.png'
    img.onload = () => {
        // Draw the base sprite
        c.drawImage(img, pos.x, pos.y, dim.x, dim.y)

        // Tint it using source-atop to color only opaque pixels
        c.globalCompositeOperation = 'source-atop'
        drawRect(pos, dim, colour)
        c.globalCompositeOperation = 'source-over'

        // Now load and draw the outline
        let outline = new Image()
        outline.src = 'Sprites/slimeOutline.png'
        outline.onload = () => {
            c.drawImage(outline, pos.x, pos.y, dim.x, dim.y)
        }
    }
}
class Slime {
    constructor(pos = Vector2.zero, vel = Vector2.zero, size = 0, age = 0, gene = new Gene(0, 0, 0, Colour.white)) {
        this.pos = pos
        this.vel = vel
        this.size = size
        this.age = age
        this.gene = gene
    }
    reproduce = {
        asex() {
            slimes.push(new Slime(this.pos.add(Vector2.random().normalize().multiply(this.size)), Vector2.zero, this.size, 0, this.gene.mutate()))
        },
        sex(partner = new Slime()) {

        }
    }
    draw() {
        drawColouredSprite(this.pos.add(Vector2.unit.multiply(-this.size/2)), Vector2.unit.multiply(this.size), this.gene.colour)
    }
    update() {
        this.vel.y += 0.01
        for (let i of walls) {
            if (this.pos.add(this.vel).inBoundsRect(i.pos, i.pos.add(i.dim))) {
                this.vel.x *= -0.9
                this.vel.y *= -0.9
            }
        }
        this.pos = this.pos.add(this.vel)
    }
}
class Gene {
    constructor(jumpFrequency, jumpHeight, jumpDistance, colour) {
        this.jumpFrequency = jumpFrequency
        this.jumpHeight = jumpHeight
        this.jumpDistance = jumpDistance
        this.colour = colour
    }
    mutate() {
        for (let i in this) {
            if (typeof this[i] != 'number') continue
        }
        this.colour = Colour.blend(this.colour, Colour.random(), 0.99)
    }
}
class Wall {
    constructor(pos, dim) {
        this.pos = pos
        this.dim = dim
    }
    draw() {
        drawRect(this.pos, this.dim, Colour.black)
    }
}
let slimes = []
let walls = [
    new Wall(new Vector2(0, canvas.height * 0.95), new Vector2(canvas.width, canvas.height * 0.05)),
    new Wall(new Vector2(0, 0), new Vector2(canvas.width, canvas.height * 0.05)),
    new Wall(new Vector2(0, 0), new Vector2(canvas.width * 0.05, canvas.height)),
    new Wall(new Vector2(canvas.width * 0.95, 0), new Vector2(canvas.width * 0.05, canvas.height))
]
function draw() {
    for (let i of slimes) {
        i.draw()
    }
    for (let i of walls) {
        i.draw()
    }
}
function run() {
    clear()
    draw()
    for (let i of slimes) {
        i.update()
    }
}
setInterval(run, 1)
