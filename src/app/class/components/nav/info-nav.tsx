import cssModule from "./style.module.css";
export function InfoNav(Props: {
  user_name: string;
  online_number: string;
  clickHandler?: {
    quit?: () => void;
    name?: () => void;
    memberCounter?: () => void;
  };
}) {
  return (
    <nav className="navbar navbar-expand-md navbar-dark fixed-top">
      <div className="container-fluid">
        <div
          className={`navbar-brand ${cssModule["user-name"]}`}
          onClick={() => {
            Props.clickHandler?.name?.();
          }}
        >
          {Props.user_name}
        </div>
        <div>
          <span
            className={cssModule["member-counter"]}
            onClick={() => {
              Props.clickHandler?.memberCounter?.();
            }}
          >
            {Props.online_number}人
          </span>
          <button
            className={`btn ${cssModule["quit-btn"]}`}
            onClick={() => {
              Props.clickHandler?.quit?.();
            }}
          ></button>
        </div>
      </div>
    </nav>
  );
}
