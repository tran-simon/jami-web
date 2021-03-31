import React from 'react'

class NewContactForm extends React.Component {
    render() {
        return (
            <div className="new-room-form">
                <form>
                    <input
                        type="text"
                        placeholder="Ajouter un contact"
                        required />
                    <button id="create-room-btn" type="submit">+</button>
                </form>
            </div>
        )
    }
}

export default NewContactForm