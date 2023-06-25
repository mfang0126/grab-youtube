import { type FC } from "react";

interface FormatsButtonGroupProps {
  options: string[];
}

const FormatsButtonGroup: FC<FormatsButtonGroupProps> = ({ options }) => {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white">
        Select Formats
      </h1>
      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {options.map((option) => (
          <div className="rounded-md bg-base-100 px-4" key={option}>
            <label className="label cursor-pointer">
              <span className="label-text">{option}</span>
              <input
                type="radio"
                name="radio-10"
                className="radio checked:bg-red-500"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormatsButtonGroup;
