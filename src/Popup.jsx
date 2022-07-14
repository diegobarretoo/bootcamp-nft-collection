import "./styles/App.css"

export const Popup = ({openseaLink, setPopupIsVisible}) => {
  const cliquei = (event) => {
    const classNameOfClickedElement = event.target.classList[0]
    const classNames = ['popup-close', 'popup-wrapper']
    const shouldClosePopup = classNames.some(className => className === classNameOfClickedElement)

    if (shouldClosePopup) {
      setPopupIsVisible(false)      
    }
  }
  
  return (
    <div className="popup-wrapper" onClick={cliquei}>
      <div className="popup">
        <div className="popup-close" onClick={cliquei}>x</div>
        
        <div className="popup-content">
          <h2>Mintado com Sucesso!</h2>
          <br />
          <p>Parabéns! Seu NFT foi mintado com sucesso. Pode ser que leve até 10 minutos para que apareça no Opensea. Aqui está o link:</p>
          <br />
          <a className="popup-link" href={openseaLink} target="_blank" rel="noreferrer">Ver NFT na Opensea</a>
        </div>
      </div>
    </div>
  )
}