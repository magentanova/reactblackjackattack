import React from 'react'
import ReactDOM from 'react-dom'
import Backbone from 'backbone'

const app = function() {

	const scaledRandom = function(n) {
	    var newNumber = Math.random() * n
	    return Math.floor(newNumber)
	}

	Array.prototype.choice = function() {
	    var randomIndex = scaledRandom(this.length)
	    return this[randomIndex]
	}

	const isFaceCard = function(str) {
		return isNaN(str)
	}

	const getCardVal = function(cardString) {
		if (cardString === 'ace') {
			return 11
		}
		else if (isFaceCard(cardString)) {
			return 10
		}
		else {
			return parseInt(cardString)
		}
	}

	const getHandSum = function(hand) {
		return hand.map(getCardVal).reduce((total,cardVal)=>{
			return total + cardVal
		},0)
	}

	const didBust = function(hand) {
		return getHandSum(hand) > 21
	}

	const deck = 'ace king queen jack 10 9 8 7 6 5 4 3 2'.split(' ')

	const AppView = React.createClass({

		componentWillMount: function() {
			Backbone.Events.on('playerHit',() => {
				this.setState({
					playerHand: this.state.playerHand.concat(deck.choice())
				})
			})

			Backbone.Events.on('playerStay', () => {
				var thisComponent = this
				this.setState({
					dealerHitting: true
				})
				var dealerHit = function() {
					if (getHandSum(thisComponent.state.dealerHand) < 17) {
						thisComponent.setState({
							dealerHand: thisComponent.state.dealerHand.concat(deck.choice())
						})
						setTimeout(dealerHit,1000)
					}
				}
				setTimeout(dealerHit,1000)
			})
		},

		getInitialState: function() {
			return {
				dealerHand: [],
				playerHand: [],
				dealerHitting: false			
			}
		},

		_deal: function() {
			this.setState({
				playerHand: [deck.choice(),deck.choice()],
				dealerHand: [deck.choice(),deck.choice()],
				dealerHitting: false
			})
		},

		render: function() {
			return (
				<div className="blackjackContainer">
					<button onClick={this._deal}>DEAL</button>
					<PlayerSide hand={this.state.playerHand} />
					<DealerSide hitting={this.state.dealerHitting} hand={this.state.dealerHand} />
				</div>
				)
		}

	})

	const PlayerSide = React.createClass({

		_hit: function() {
			Backbone.Events.trigger('playerHit')
		},

		_stay: function() {
			Backbone.Events.trigger('playerStay')
		},

		_genCardDiv: function(cardVal) {
			return <div className="card">{cardVal}</div>
		}, 

		render: function() {

			var bustStyle = {
				display: 'none'
			}
			if (didBust(this.props.hand)) {
				console.log(didBust(this.props.hand))
				bustStyle.display = 'block'
			}

			return (
				<div className="side playerSide">
					<h3>player side</h3>
					<button onClick={this._hit} >hit</button>
					<button onClick={this._stay} >stay</button>
					<div className="cardsContainer">
						{this.props.hand.map(this._genCardDiv)}
						<p style={bustStyle} >BUST</p>
					</div>
				</div>
			)
		}
	})

	const DealerSide = React.createClass({

		_genCardDiv: function(cardVal,i) {
			var className = "card"
			if (i === 0 && !this.props.hitting) {
				className = "card first-card"
				cardVal = 'X'
			}
			return <div key={i} className={className}>{cardVal}</div>
		}, 

		render: function() {

			var bustStyle = {
				display: 'none'
			}
			if (didBust(this.props.hand)) {
				bustStyle.display = 'block'
			}

			return (
				<div className="side dealerSide">
					<h3>dealer side</h3>
					<div className="cardsContainer">
						{this.props.hand.map(this._genCardDiv)}
						<p style={bustStyle} >BUST</p>
					</div>
				</div>
			)
		}
	})

	ReactDOM.render(<AppView />,document.querySelector('.container'))
}

app()