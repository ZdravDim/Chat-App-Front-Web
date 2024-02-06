import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './Main.css'

function Main() {
    const sendMessage = (event) => {
        event.preventDefault();
        //send a message...
        console.log('Message sent!');
      };
    
      return (
        <div className="d-flex flex-column h-100">
          <div className="flex-grow-1 mb-auto bg-dark">
              {/* messages here*/}
          </div>
    
          <Form onSubmit={sendMessage} className='d-flex w-100 p-3'>
              <Form.Control
              type="text"
              placeholder="Enter a message..."
              className="shadow-none rounded-0"
              />  
              <Button type="submit" className="btn-success rounded-0">Send</Button>
          </Form>
        </div>
      );
}

export default Main